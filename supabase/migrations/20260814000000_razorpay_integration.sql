-- Wire up real Razorpay online payments in place of the previous
-- "online = instantly simulated" checkout path. Orders placed with
-- payment_method = 'online' now stay payment_status = 'pending' until the
-- Razorpay order is created and the checkout is actually completed and
-- signature-verified (see actions/checkout.ts and
-- app/api/webhooks/razorpay/route.ts). COD behaviour is unchanged.

alter table public.orders add column if not exists razorpay_order_id text;
alter table public.orders add column if not exists razorpay_payment_id text;

create unique index if not exists orders_razorpay_order_id_uidx
  on public.orders(razorpay_order_id)
  where razorpay_order_id is not null;

-- Guest checkout (used by the storefront's OTP-verified guest sessions).
create or replace function public.place_guest_order(
  customer_name_input text,
  customer_phone_input text,
  shipping_address_input jsonb,
  items_input jsonb,
  payment_method_input text,
  idempotency_key_input text,
  coupon_input text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text := trim(coalesce(customer_name_input, ''));
  normalized_phone text := regexp_replace(coalesce(customer_phone_input, ''), '[^0-9]', '', 'g');
  normalized_coupon text := upper(trim(coalesce(coupon_input, '')));
  shipping_settings jsonb;
  selected_coupon public.coupons%rowtype;
  created_order public.orders%rowtype;
  line_record record;
  submitted_count integer;
  available_count integer;
  subtotal_value numeric(12,2) := 0;
  discount_value numeric(12,2) := 0;
  shipping_value numeric(12,2) := 0;
  cod_value numeric(12,2) := 0;
  online_discount_value numeric(12,2) := 0;
  total_value numeric(12,2) := 0;
  flat_rate_value numeric(12,2);
  free_threshold_value numeric(12,2);
  cod_charge_value numeric(12,2);
  online_discount_percent numeric(7,4);
begin
  if char_length(normalized_name) < 2 or char_length(normalized_name) > 80 then
    raise exception 'A valid customer name is required.';
  end if;
  if normalized_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'A valid 10-digit Indian mobile number is required.';
  end if;
  if jsonb_typeof(shipping_address_input) <> 'object'
    or trim(coalesce(shipping_address_input->>'address_line_1', '')) = ''
    or trim(coalesce(shipping_address_input->>'city', '')) = ''
    or trim(coalesce(shipping_address_input->>'state', '')) = ''
    or coalesce(shipping_address_input->>'postal_code', '') !~ '^[0-9]{6}$' then
    raise exception 'A valid shipping address is required.';
  end if;
  if idempotency_key_input is null
    or char_length(trim(idempotency_key_input)) < 8
    or char_length(trim(idempotency_key_input)) > 128 then
    raise exception 'A valid checkout idempotency key is required.';
  end if;
  if payment_method_input not in ('cod', 'online') then
    raise exception 'Unsupported payment method.';
  end if;
  if jsonb_typeof(items_input) <> 'array' or jsonb_array_length(items_input) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(normalized_phone || ':' || trim(idempotency_key_input), 0)
  );

  select * into created_order
  from public.orders
  where user_id is null
    and customer_phone = normalized_phone
    and idempotency_key = trim(idempotency_key_input);

  if found then
    return jsonb_build_object(
      'id', created_order.id,
      'orderNumber', created_order.order_number,
      'createdAt', created_order.created_at,
      'currencyCode', created_order.currency_code,
      'subtotal', created_order.subtotal,
      'discount', created_order.discount,
      'shipping', created_order.shipping_cost,
      'codFee', created_order.cod_cost,
      'onlineDiscount', created_order.online_discount_amount,
      'total', created_order.total_amount,
      'paymentMethod', created_order.payment_method,
      'paymentStatus', created_order.payment_status,
      'status', created_order.order_status
    );
  end if;

  select shipping into shipping_settings
  from public.settings
  where id = 'global-settings-id'
  for share;
  if shipping_settings is null then
    raise exception 'Checkout settings are unavailable.';
  end if;

  flat_rate_value := greatest(0, coalesce((shipping_settings->>'flat_rate')::numeric, 99));
  free_threshold_value := greatest(0, coalesce((shipping_settings->>'free_threshold')::numeric, 1999));
  cod_charge_value := greatest(0, coalesce((shipping_settings->>'cod_charge')::numeric, 50));
  online_discount_percent := least(
    100, greatest(0, coalesce((shipping_settings->>'online_discount')::numeric, 0))
  );

  select count(*) into submitted_count
  from (
    select (item->>'variantId')::uuid
    from jsonb_array_elements(items_input) item
    where jsonb_typeof(item) = 'object'
      and item ? 'variantId'
      and item ? 'quantity'
      and (item->>'quantity') ~ '^[1-9][0-9]*$'
    group by (item->>'variantId')::uuid
  ) submitted;

  select count(*) into available_count
  from (
    select variants.id
    from jsonb_array_elements(items_input) item
    join public.product_variants variants
      on variants.id = (item->>'variantId')::uuid and variants.is_active
    join public.products products
      on products.id = variants.product_id and products.is_active
    where jsonb_typeof(item) = 'object'
      and (item->>'quantity') ~ '^[1-9][0-9]*$'
    group by variants.id
  ) available;

  if submitted_count = 0 or submitted_count <> available_count then
    raise exception 'Your cart contains an invalid or unavailable item.';
  end if;

  for line_record in
    with requested_items as (
      select
        (item->>'variantId')::uuid as variant_id,
        sum((item->>'quantity')::integer)::integer as quantity
      from jsonb_array_elements(items_input) item
      group by (item->>'variantId')::uuid
    )
    select
      variants.id as variant_id,
      variants.product_id,
      variants.variant_name,
      variants.price,
      variants.stock_quantity,
      products.name as product_name,
      requested_items.quantity
    from requested_items
    join public.product_variants variants
      on variants.id = requested_items.variant_id and variants.is_active
    join public.products products
      on products.id = variants.product_id and products.is_active
    order by variants.id
    for update of variants
  loop
    if line_record.stock_quantity < line_record.quantity then
      raise exception 'Not enough stock for %.', line_record.product_name;
    end if;
    subtotal_value := subtotal_value + round(line_record.price * line_record.quantity, 2);
  end loop;

  if normalized_coupon <> '' then
    select * into selected_coupon
    from public.coupons
    where code = normalized_coupon
      and is_active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
      and (usage_limit is null or usage_count < usage_limit)
    for update;
    if not found then raise exception 'Invalid or inactive coupon code.'; end if;
    if subtotal_value < coalesce(selected_coupon.min_purchase, 0) then
      raise exception 'The coupon minimum purchase has not been reached.';
    end if;
    if selected_coupon.type = 'percentage' then
      discount_value := round(
        subtotal_value * least(100, greatest(0, selected_coupon.value)) / 100, 2
      );
    elsif selected_coupon.type = 'flat' then
      discount_value := least(subtotal_value, greatest(0, selected_coupon.value));
    else
      raise exception 'Unsupported coupon type.';
    end if;
  end if;

  if subtotal_value < free_threshold_value then shipping_value := flat_rate_value; end if;
  if payment_method_input = 'cod' then
    cod_value := cod_charge_value;
  else
    online_discount_value := round(
      (subtotal_value - discount_value) * online_discount_percent / 100, 2
    );
  end if;
  total_value := greatest(
    0, subtotal_value - discount_value + shipping_value + cod_value - online_discount_value
  );

  insert into public.guest_customers (
    phone, full_name, first_order_at, last_order_at, order_count, updated_at
  ) values (
    normalized_phone, normalized_name, now(), now(), 1, now()
  )
  on conflict (phone) do update set
    full_name = excluded.full_name,
    last_order_at = now(),
    order_count = public.guest_customers.order_count + 1,
    updated_at = now();

  insert into public.orders (
    order_number, user_id, address_id, customer_name, customer_phone,
    shipping_address, currency_code, subtotal, discount, shipping_cost,
    cod_cost, online_discount_amount, total_amount, coupon_code,
    idempotency_key, payment_method, payment_status, order_status
  ) values (
    'PAN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    null, null, normalized_name, normalized_phone,
    shipping_address_input || jsonb_build_object(
      'full_name', normalized_name, 'phone', normalized_phone, 'country', 'India'
    ),
    'INR', subtotal_value, discount_value, shipping_value, cod_value,
    online_discount_value, total_value, nullif(normalized_coupon, ''),
    trim(idempotency_key_input), payment_method_input,
    -- Real Razorpay orders are created by the caller right after this
    -- returns and stay 'pending' until the signature-verified callback or
    -- webhook marks them 'paid'. COD orders remain 'pending' until delivery.
    'pending',
    'pending'
  ) returning * into created_order;

  for line_record in
    with requested_items as (
      select
        (item->>'variantId')::uuid as variant_id,
        sum((item->>'quantity')::integer)::integer as quantity
      from jsonb_array_elements(items_input) item
      group by (item->>'variantId')::uuid
    )
    select
      variants.id as variant_id, variants.product_id, variants.variant_name,
      variants.price, products.name as product_name, requested_items.quantity
    from requested_items
    join public.product_variants variants on variants.id = requested_items.variant_id
    join public.products products on products.id = variants.product_id
  loop
    insert into public.order_items (
      order_id, product_id, variant_id, product_name, variant_name,
      price_at_purchase, quantity, line_total
    ) values (
      created_order.id, line_record.product_id, line_record.variant_id,
      line_record.product_name, line_record.variant_name, line_record.price,
      line_record.quantity, round(line_record.price * line_record.quantity, 2)
    );
    update public.product_variants
    set stock_quantity = stock_quantity - line_record.quantity
    where id = line_record.variant_id;
  end loop;

  if normalized_coupon <> '' then
    update public.coupons set usage_count = usage_count + 1 where id = selected_coupon.id;
  end if;

  return jsonb_build_object(
    'id', created_order.id,
    'orderNumber', created_order.order_number,
    'createdAt', created_order.created_at,
    'currencyCode', created_order.currency_code,
    'subtotal', created_order.subtotal,
    'discount', created_order.discount,
    'shipping', created_order.shipping_cost,
    'codFee', created_order.cod_cost,
    'onlineDiscount', created_order.online_discount_amount,
    'total', created_order.total_amount,
    'paymentMethod', created_order.payment_method,
    'paymentStatus', created_order.payment_status,
    'status', created_order.order_status
  );
end;
$$;

-- Authenticated checkout (kept in sync even though the current storefront
-- only calls place_guest_order, so both paths behave consistently).
create or replace function public.place_order(
  user_id_input uuid,
  address_id_input uuid,
  items_input jsonb,
  payment_method_input text,
  idempotency_key_input text,
  coupon_input text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  shipping_settings jsonb;
  selected_address public.addresses%rowtype;
  selected_coupon public.coupons%rowtype;
  created_order public.orders%rowtype;
  line_record record;
  subtotal_value numeric(12,2) := 0;
  discount_value numeric(12,2) := 0;
  shipping_value numeric(12,2) := 0;
  cod_value numeric(12,2) := 0;
  online_discount_value numeric(12,2) := 0;
  total_value numeric(12,2) := 0;
  flat_rate_value numeric(12,2);
  free_threshold_value numeric(12,2);
  cod_charge_value numeric(12,2);
  online_discount_percent numeric(7,4);
  normalized_coupon text := upper(trim(coalesce(coupon_input, '')));
begin
  if user_id_input is null then
    raise exception 'Authentication is required.';
  end if;
  if idempotency_key_input is null
    or char_length(trim(idempotency_key_input)) < 8
    or char_length(trim(idempotency_key_input)) > 128 then
    raise exception 'A valid checkout idempotency key is required.';
  end if;
  if payment_method_input not in ('cod', 'online') then
    raise exception 'Unsupported payment method.';
  end if;
  if jsonb_typeof(items_input) <> 'array' or jsonb_array_length(items_input) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(user_id_input::text || ':' || trim(idempotency_key_input), 0)
  );

  select *
  into created_order
  from public.orders
  where user_id = user_id_input
    and idempotency_key = trim(idempotency_key_input);

  if found then
    return jsonb_build_object(
      'id', created_order.id,
      'orderNumber', created_order.order_number,
      'createdAt', created_order.created_at,
      'currencyCode', created_order.currency_code,
      'subtotal', created_order.subtotal,
      'discount', created_order.discount,
      'shipping', created_order.shipping_cost,
      'codFee', created_order.cod_cost,
      'onlineDiscount', created_order.online_discount_amount,
      'total', created_order.total_amount,
      'paymentMethod', created_order.payment_method,
      'paymentStatus', created_order.payment_status,
      'status', created_order.order_status
    );
  end if;

  select *
  into selected_address
  from public.addresses
  where id = address_id_input and user_id = user_id_input
  for share;
  if not found then
    raise exception 'Invalid shipping address.';
  end if;

  select shipping
  into shipping_settings
  from public.settings
  where id = 'global-settings-id'
  for share;
  if shipping_settings is null then
    raise exception 'Checkout settings are unavailable.';
  end if;

  flat_rate_value := greatest(0, coalesce((shipping_settings->>'flat_rate')::numeric, 99));
  free_threshold_value := greatest(0, coalesce((shipping_settings->>'free_threshold')::numeric, 1999));
  cod_charge_value := greatest(0, coalesce((shipping_settings->>'cod_charge')::numeric, 50));
  online_discount_percent := least(
    100,
    greatest(0, coalesce((shipping_settings->>'online_discount')::numeric, 0))
  );

  for line_record in
    with requested_items as (
      select
        (item->>'variantId')::uuid as variant_id,
        sum((item->>'quantity')::integer)::integer as quantity
      from jsonb_array_elements(items_input) item
      where jsonb_typeof(item) = 'object'
        and item ? 'variantId'
        and item ? 'quantity'
      group by (item->>'variantId')::uuid
    )
    select
      variants.id as variant_id,
      variants.product_id,
      variants.variant_name,
      variants.price,
      variants.stock_quantity,
      products.name as product_name,
      requested_items.quantity
    from requested_items
    join public.product_variants variants
      on variants.id = requested_items.variant_id
      and variants.is_active
    join public.products products
      on products.id = variants.product_id
      and products.is_active
    order by variants.id
    for update of variants
  loop
    if line_record.quantity <= 0 then
      raise exception 'Invalid item quantity.';
    end if;
    if line_record.stock_quantity < line_record.quantity then
      raise exception 'Not enough stock for %.', line_record.product_name;
    end if;
    subtotal_value := subtotal_value + round(line_record.price * line_record.quantity, 2);
  end loop;

  if subtotal_value <= 0 then
    raise exception 'Your cart contains no purchasable items.';
  end if;

  if (
    select count(*)
    from (
      select (item->>'variantId')::uuid
      from jsonb_array_elements(items_input) item
      group by (item->>'variantId')::uuid
    ) submitted
  ) <> (
    select count(*)
    from (
      select variants.id
      from jsonb_array_elements(items_input) item
      join public.product_variants variants
        on variants.id = (item->>'variantId')::uuid
        and variants.is_active
      join public.products products
        on products.id = variants.product_id
        and products.is_active
      group by variants.id
    ) available
  ) then
    raise exception 'Your cart contains an unavailable item.';
  end if;

  if normalized_coupon <> '' then
    select *
    into selected_coupon
    from public.coupons
    where code = normalized_coupon
      and is_active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
      and (usage_limit is null or usage_count < usage_limit)
    for update;
    if not found then
      raise exception 'Invalid or inactive coupon code.';
    end if;
    if subtotal_value < coalesce(selected_coupon.min_purchase, 0) then
      raise exception 'The coupon minimum purchase has not been reached.';
    end if;
    if selected_coupon.type = 'percentage' then
      discount_value := round(
        subtotal_value * least(100, greatest(0, selected_coupon.value)) / 100,
        2
      );
    elsif selected_coupon.type = 'flat' then
      discount_value := least(subtotal_value, greatest(0, selected_coupon.value));
    else
      raise exception 'Unsupported coupon type.';
    end if;
  end if;

  if subtotal_value < free_threshold_value then
    shipping_value := flat_rate_value;
  end if;
  if payment_method_input = 'cod' then
    cod_value := cod_charge_value;
  else
    online_discount_value := round(
      (subtotal_value - discount_value) * online_discount_percent / 100,
      2
    );
  end if;
  total_value := greatest(
    0,
    subtotal_value - discount_value + shipping_value + cod_value - online_discount_value
  );

  insert into public.orders (
    order_number,
    user_id,
    address_id,
    shipping_address,
    currency_code,
    subtotal,
    discount,
    shipping_cost,
    cod_cost,
    online_discount_amount,
    total_amount,
    coupon_code,
    idempotency_key,
    payment_method,
    payment_status,
    order_status
  ) values (
    'PAN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    user_id_input,
    address_id_input,
    jsonb_build_object(
      'full_name', selected_address.full_name,
      'phone', selected_address.phone,
      'alternate_phone', selected_address.alternate_phone,
      'address_line_1', selected_address.address_line_1,
      'address_line_2', selected_address.address_line_2,
      'city', selected_address.city,
      'state', selected_address.state,
      'postal_code', selected_address.postal_code,
      'country', selected_address.country
    ),
    'INR',
    subtotal_value,
    discount_value,
    shipping_value,
    cod_value,
    online_discount_value,
    total_value,
    nullif(normalized_coupon, ''),
    trim(idempotency_key_input),
    payment_method_input,
    -- See place_guest_order — real Razorpay orders stay 'pending' until
    -- payment is signature-verified or the webhook confirms capture.
    'pending',
    'pending'
  )
  returning * into created_order;

  for line_record in
    with requested_items as (
      select
        (item->>'variantId')::uuid as variant_id,
        sum((item->>'quantity')::integer)::integer as quantity
      from jsonb_array_elements(items_input) item
      group by (item->>'variantId')::uuid
    )
    select
      variants.id as variant_id,
      variants.product_id,
      variants.variant_name,
      variants.price,
      products.name as product_name,
      requested_items.quantity
    from requested_items
    join public.product_variants variants on variants.id = requested_items.variant_id
    join public.products products on products.id = variants.product_id
  loop
    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      price_at_purchase,
      quantity,
      line_total
    ) values (
      created_order.id,
      line_record.product_id,
      line_record.variant_id,
      line_record.product_name,
      line_record.variant_name,
      line_record.price,
      line_record.quantity,
      round(line_record.price * line_record.quantity, 2)
    );

    update public.product_variants
    set stock_quantity = stock_quantity - line_record.quantity
    where id = line_record.variant_id;
  end loop;

  if normalized_coupon <> '' then
    update public.coupons
    set usage_count = usage_count + 1
    where id = selected_coupon.id;
  end if;

  delete from public.cart_items where user_id = user_id_input;

  return jsonb_build_object(
    'id', created_order.id,
    'orderNumber', created_order.order_number,
    'createdAt', created_order.created_at,
    'currencyCode', created_order.currency_code,
    'subtotal', created_order.subtotal,
    'discount', created_order.discount,
    'shipping', created_order.shipping_cost,
    'codFee', created_order.cod_cost,
    'onlineDiscount', created_order.online_discount_amount,
    'total', created_order.total_amount,
    'paymentMethod', created_order.payment_method,
    'paymentStatus', created_order.payment_status,
    'status', created_order.order_status
  );
end;
$$;
