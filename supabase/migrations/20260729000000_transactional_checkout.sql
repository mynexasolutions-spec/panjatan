-- Panjatan Ayurveda single-market checkout.
-- This migration preserves existing commerce records while making checkout
-- database-authoritative and atomic. Online payment is an explicit simulation:
-- no payment credentials are collected and no gateway is contacted.

create extension if not exists "pgcrypto";

-- The connected Panjatan catalog currently stores integer product IDs.
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id integer not null references public.products(id) on delete cascade,
  variant_name text not null,
  price numeric(12,2) not null check (price >= 0),
  original_price numeric(12,2),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'flat')),
  value numeric(12,2) not null check (value >= 0),
  min_purchase numeric(12,2) not null default 0 check (min_purchase >= 0),
  is_active boolean not null default true,
  usage_count integer not null default 0,
  usage_limit integer,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  alternate_phone text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key,
  shipping jsonb not null default
    '{"flat_rate":99,"free_threshold":1999,"cod_charge":50,"online_discount":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.settings (id, shipping)
values (
  'global-settings-id',
  '{"flat_rate":99,"free_threshold":1999,"cod_charge":50,"online_discount":0}'::jsonb
)
on conflict (id) do nothing;

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, variant_id)
);

alter table public.cart_items add column if not exists user_id uuid;
alter table public.cart_items add column if not exists variant_id uuid;
alter table public.cart_items add column if not exists quantity integer default 1;
alter table public.cart_items add column if not exists created_at timestamptz default now();
alter table public.cart_items add column if not exists updated_at timestamptz default now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  address_id uuid references public.addresses(id) on delete set null,
  shipping_address jsonb not null,
  currency_code text not null default 'INR',
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  shipping_cost numeric(12,2) not null default 0,
  cod_cost numeric(12,2) not null default 0,
  online_discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  coupon_code text,
  idempotency_key text,
  payment_method text not null,
  payment_status text not null default 'pending',
  order_status text not null default 'pending',
  stock_restored_at timestamptz,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id integer references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  price_at_purchase numeric(12,2) not null,
  quantity integer not null,
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- Reconcile deployments that already have the tables but not the checkout
-- columns. Defaults keep existing rows valid.
alter table public.addresses add column if not exists alternate_phone text;
alter table public.addresses add column if not exists address_line_2 text;
alter table public.addresses add column if not exists country text default 'India';
alter table public.addresses add column if not exists is_default boolean default false;
alter table public.addresses add column if not exists created_at timestamptz default now();
alter table public.addresses add column if not exists updated_at timestamptz default now();

alter table public.settings add column if not exists shipping jsonb default
  '{"flat_rate":99,"free_threshold":1999,"cod_charge":50,"online_discount":0}'::jsonb;

alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete restrict;
alter table public.orders add column if not exists address_id uuid references public.addresses(id) on delete set null;
alter table public.orders add column if not exists shipping_address jsonb;
alter table public.orders add column if not exists currency_code text default 'INR';
alter table public.orders add column if not exists subtotal numeric(12,2) default 0;
alter table public.orders add column if not exists discount numeric(12,2) default 0;
alter table public.orders add column if not exists shipping_cost numeric(12,2) default 0;
alter table public.orders add column if not exists cod_cost numeric(12,2) default 0;
alter table public.orders add column if not exists online_discount_amount numeric(12,2) default 0;
alter table public.orders add column if not exists total_amount numeric(12,2) default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists idempotency_key text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists payment_status text default 'pending';
alter table public.orders add column if not exists order_status text default 'pending';
alter table public.orders add column if not exists stock_restored_at timestamptz;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists delivered_at timestamptz;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists updated_at timestamptz default now();

update public.orders
set shipping_address = jsonb_build_object(
  'full_name', addresses.full_name,
  'phone', addresses.phone,
  'alternate_phone', addresses.alternate_phone,
  'address_line_1', addresses.address_line_1,
  'address_line_2', addresses.address_line_2,
  'city', addresses.city,
  'state', addresses.state,
  'postal_code', addresses.postal_code,
  'country', addresses.country
)
from public.addresses
where orders.address_id = addresses.id
  and orders.shipping_address is null;

alter table public.order_items add column if not exists product_id integer;
alter table public.order_items add column if not exists variant_id uuid;
alter table public.order_items add column if not exists product_name text;
alter table public.order_items add column if not exists variant_name text;
alter table public.order_items add column if not exists price_at_purchase numeric(12,2);
alter table public.order_items add column if not exists quantity integer;
alter table public.order_items add column if not exists line_total numeric(12,2);
alter table public.order_items add column if not exists created_at timestamptz default now();

alter table public.coupons add column if not exists usage_count integer not null default 0;
alter table public.coupons add column if not exists usage_limit integer;
alter table public.coupons add column if not exists starts_at timestamptz;
alter table public.coupons add column if not exists ends_at timestamptz;

-- Every purchasable product needs a genuine variant UUID. Existing variants and
-- product records are retained.
insert into public.product_variants (
  product_id, variant_name, price, original_price, stock_quantity, is_active
)
select
  products.id,
  'Default',
  coalesce(products.price, 0),
  products.old_price,
  case when products.in_stock then 100 else 0 end,
  products.is_active
from public.products
where not exists (
  select 1
  from public.product_variants
  where product_variants.product_id = products.id
);

-- Retain the quantity represented by legacy duplicate cart rows before adding
-- the synchronization key expected by authenticated cart upserts.
with duplicate_totals as (
  select
    user_id,
    variant_id,
    min(id::text) as kept_id,
    sum(greatest(quantity, 1))::integer as total_quantity
  from public.cart_items
  where user_id is not null and variant_id is not null
  group by user_id, variant_id
  having count(*) > 1
)
update public.cart_items cart
set quantity = duplicate_totals.total_quantity
from duplicate_totals
where cart.id::text = duplicate_totals.kept_id;

with duplicate_rows as (
  select
    id,
    row_number() over (
      partition by user_id, variant_id
      order by id::text
    ) as row_number
  from public.cart_items
  where user_id is not null and variant_id is not null
)
delete from public.cart_items cart
using duplicate_rows
where cart.id = duplicate_rows.id
  and duplicate_rows.row_number > 1;

create unique index if not exists cart_items_user_variant_uidx
  on public.cart_items(user_id, variant_id);
create index if not exists addresses_user_idx
  on public.addresses(user_id, created_at desc);
create index if not exists orders_user_created_idx
  on public.orders(user_id, created_at desc);
create unique index if not exists orders_user_idempotency_uidx
  on public.orders(user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists order_items_order_idx
  on public.order_items(order_id);

-- Replace legacy payment checks so the simulated status and gateway-free
-- payment method are accepted. Other existing constraints are left untouched.
do $$
declare constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and (
        pg_get_constraintdef(oid) ilike '%payment_status%'
        or pg_get_constraintdef(oid) ilike '%payment_method%'
      )
  loop
    execute format(
      'alter table public.orders drop constraint %I',
      constraint_record.conname
    );
  end loop;
end;
$$;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('cod', 'online')) not valid;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'simulated', 'paid', 'failed', 'refunded')) not valid;
alter table public.orders drop constraint if exists orders_amounts_nonnegative_check;
alter table public.orders
  add constraint orders_amounts_nonnegative_check
  check (
    subtotal >= 0
    and discount >= 0
    and shipping_cost >= 0
    and cod_cost >= 0
    and online_discount_amount >= 0
    and total_amount >= 0
  ) not valid;
alter table public.orders drop constraint if exists orders_shipping_address_present_check;
alter table public.orders
  add constraint orders_shipping_address_present_check
  check (shipping_address is not null) not valid;
alter table public.order_items drop constraint if exists order_items_quantity_positive_check;
alter table public.order_items
  add constraint order_items_quantity_positive_check
  check (quantity > 0) not valid;
alter table public.order_items drop constraint if exists order_items_amounts_nonnegative_check;
alter table public.order_items
  add constraint order_items_amounts_nonnegative_check
  check (price_at_purchase >= 0 and line_total >= 0) not valid;
alter table public.cart_items drop constraint if exists cart_items_quantity_positive_check;
alter table public.cart_items
  add constraint cart_items_quantity_positive_check
  check (quantity > 0) not valid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cart_items'::regclass
      and contype = 'f'
      and conname = 'cart_items_user_id_fkey'
  ) then
    alter table public.cart_items
      add constraint cart_items_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cart_items'::regclass
      and contype = 'f'
      and conname = 'cart_items_variant_id_fkey'
  ) then
    alter table public.cart_items
      add constraint cart_items_variant_id_fkey
      foreign key (variant_id) references public.product_variants(id) on delete cascade not valid;
  end if;
end;
$$;

alter table public.addresses enable row level security;
alter table public.product_variants enable row level security;
alter table public.coupons enable row level security;
alter table public.settings enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers manage own addresses" on public.addresses;
create policy "Customers manage own addresses"
on public.addresses for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Public reads active product variants" on public.product_variants;
create policy "Public reads active product variants"
on public.product_variants for select to anon, authenticated
using (
  is_active
  and exists (
    select 1 from public.products
    where products.id = product_variants.product_id and products.is_active
  )
);

drop policy if exists "Public reads active coupons" on public.coupons;
create policy "Public reads active coupons"
on public.coupons for select to anon, authenticated
using (
  is_active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
  and (usage_limit is null or usage_count < usage_limit)
);

drop policy if exists "Public reads store settings" on public.settings;
create policy "Public reads store settings"
on public.settings for select to anon, authenticated
using (true);

drop policy if exists "Customers manage own cart" on public.cart_items;
create policy "Customers manage own cart"
on public.cart_items for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders"
on public.orders for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items"
on public.order_items for select to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);

revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;
revoke insert, update, delete on public.product_variants from anon, authenticated;
revoke insert, update, delete on public.coupons from anon, authenticated;

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

  -- Serialize retries for one customer/key, including concurrent double-clicks.
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

  -- Aggregate duplicate variant entries before locking. This prevents the same
  -- stock from being counted twice and gives every line one immutable snapshot.
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

  -- Detect malformed or unavailable lines that the validated join omitted.
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
    case when payment_method_input = 'online' then 'simulated' else 'pending' end,
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

revoke all on function public.place_order(uuid, uuid, jsonb, text, text, text)
  from public, anon, authenticated;
grant execute on function public.place_order(uuid, uuid, jsonb, text, text, text)
  to service_role;

create or replace function public.merge_cart(
  user_id_input uuid,
  items_input jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_count integer;
  available_count integer;
  merged_lines integer;
  cart_quantity integer;
begin
  if user_id_input is null then
    raise exception 'Authentication is required.';
  end if;
  if jsonb_typeof(items_input) <> 'array' then
    raise exception 'Cart items must be an array.';
  end if;
  if jsonb_array_length(items_input) = 0 then
    select coalesce(sum(quantity), 0)::integer
    into cart_quantity
    from public.cart_items
    where user_id = user_id_input;
    return jsonb_build_object('mergedLines', 0, 'cartQuantity', cart_quantity);
  end if;

  select count(*)
  into submitted_count
  from (
    select (item->>'variantId')::uuid
    from jsonb_array_elements(items_input) item
    where jsonb_typeof(item) = 'object'
      and item ? 'variantId'
      and item ? 'quantity'
      and (item->>'quantity')::integer > 0
    group by (item->>'variantId')::uuid
  ) submitted;

  select count(*)
  into available_count
  from (
    select variants.id
    from jsonb_array_elements(items_input) item
    join public.product_variants variants
      on variants.id = (item->>'variantId')::uuid
      and variants.is_active
      and variants.stock_quantity > 0
    join public.products products
      on products.id = variants.product_id
      and products.is_active
    where (item->>'quantity')::integer > 0
    group by variants.id
  ) available;

  if submitted_count = 0 or submitted_count <> available_count then
    raise exception 'The guest cart contains an invalid or unavailable item.';
  end if;

  insert into public.cart_items (user_id, variant_id, quantity)
  select
    user_id_input,
    variants.id,
    least(
      variants.stock_quantity,
      sum((item->>'quantity')::integer)::integer
    )
  from jsonb_array_elements(items_input) item
  join public.product_variants variants
    on variants.id = (item->>'variantId')::uuid
    and variants.is_active
  join public.products products
    on products.id = variants.product_id
    and products.is_active
  where (item->>'quantity')::integer > 0
  group by variants.id, variants.stock_quantity
  on conflict (user_id, variant_id) do update
  set
    quantity = least(
      (
        select stock_quantity
        from public.product_variants
        where id = excluded.variant_id
      ),
      public.cart_items.quantity + excluded.quantity
    ),
    updated_at = now();

  get diagnostics merged_lines = row_count;

  select coalesce(sum(quantity), 0)::integer
  into cart_quantity
  from public.cart_items
  where user_id = user_id_input;

  return jsonb_build_object(
    'mergedLines', merged_lines,
    'cartQuantity', cart_quantity
  );
end;
$$;

revoke all on function public.merge_cart(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.merge_cart(uuid, jsonb)
  to service_role;

create or replace function public.set_order_status(
  order_id_input uuid,
  status_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_order public.orders%rowtype;
  order_line record;
begin
  if status_input not in ('pending', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Unsupported order status.';
  end if;

  select *
  into selected_order
  from public.orders
  where id = order_id_input
  for update;
  if not found then
    raise exception 'Order not found.';
  end if;
  if selected_order.order_status = 'cancelled' and status_input <> 'cancelled' then
    raise exception 'A cancelled order cannot be reopened.';
  end if;

  if status_input = 'cancelled' and selected_order.stock_restored_at is null then
    for order_line in
      select variant_id, quantity
      from public.order_items
      where order_id = order_id_input and variant_id is not null
    loop
      update public.product_variants
      set stock_quantity = stock_quantity + order_line.quantity
      where id = order_line.variant_id;
    end loop;
  end if;

  update public.orders
  set
    order_status = status_input,
    stock_restored_at = case
      when status_input = 'cancelled' and stock_restored_at is null then now()
      else stock_restored_at
    end,
    shipped_at = case when status_input = 'shipped' then now() else shipped_at end,
    delivered_at = case when status_input = 'delivered' then now() else delivered_at end,
    cancelled_at = case when status_input = 'cancelled' then now() else cancelled_at end,
    updated_at = now()
  where id = order_id_input;
end;
$$;

revoke all on function public.set_order_status(uuid, text)
  from public, anon, authenticated;
grant execute on function public.set_order_status(uuid, text)
  to service_role;
