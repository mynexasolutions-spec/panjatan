-- Reconcile the connected Panjatan integer-ID catalog with the admin/storefront
-- interfaces. Run after transactional checkout and before storefront CMS.

create extension if not exists "pgcrypto";

alter table public.products add column if not exists category_id integer
  references public.categories(id) on delete set null;
alter table public.products add column if not exists "oldPrice" numeric(12,2);
alter table public.products add column if not exists featured_image_url text;
alter table public.products add column if not exists fabric text;
alter table public.products add column if not exists stitching text;
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists seo_description text;
alter table public.products add column if not exists color_group_id uuid;
alter table public.products add column if not exists color_name text;
alter table public.products add column if not exists color_hex text;
alter table public.products add column if not exists use_global_faqs boolean not null default true;
alter table public.products add column if not exists average_rating numeric(3,2) not null default 0;
alter table public.products add column if not exists review_count integer not null default 0;

update public.products
set
  category_id = categories.id,
  featured_image_url = coalesce(products.featured_image_url, products.image_url),
  "oldPrice" = coalesce(products."oldPrice", products.old_price),
  average_rating = coalesce(nullif(products.average_rating, 0), products.rating, 0),
  review_count = coalesce(nullif(products.review_count, 0), products.reviews_count, 0)
from public.categories
where products.category_slug = categories.slug
  and products.category_id is null;

update public.products
set
  featured_image_url = coalesce(featured_image_url, image_url),
  "oldPrice" = coalesce("oldPrice", old_price),
  average_rating = coalesce(nullif(average_rating, 0), rating, 0),
  review_count = coalesce(nullif(review_count, 0), reviews_count, 0);

alter table public.categories add column if not exists count text;
update public.categories
set count = coalesce(count, product_count::text);

alter table public.products enable row level security;
alter table public.categories enable row level security;
drop policy if exists "Public reads active products" on public.products;
create policy "Public reads active products" on public.products
for select to anon, authenticated using (is_active);
drop policy if exists "Public reads active categories" on public.categories;
create policy "Public reads active categories" on public.categories
for select to anon, authenticated using (is_active);
revoke insert, update, delete on public.products from anon, authenticated;
revoke insert, update, delete on public.categories from anon, authenticated;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id integer not null references public.products(id) on delete cascade,
  image_url text not null,
  color_name text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

insert into public.product_images (product_id, image_url, sort_order)
select id, coalesce(featured_image_url, image_url), 0
from public.products
where coalesce(featured_image_url, image_url) is not null
  and not exists (
    select 1 from public.product_images where product_images.product_id = products.id
  );

create table if not exists public.product_information (
  id uuid primary key default gen_random_uuid(),
  product_id integer not null references public.products(id) on delete cascade,
  label text not null,
  value text not null,
  display_order integer not null default 0 check (display_order >= 0)
);

create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id integer not null references public.products(id) on delete cascade,
  question text not null,
  answer text not null,
  display_order integer not null default 0 check (display_order >= 0)
);

create table if not exists public.global_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id integer not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  button_text text,
  button_link text,
  text_mode text not null default 'global',
  position text not null default 'right' check (position in ('left', 'right')),
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.settings add column if not exists home_banner_enabled boolean not null default true;

create table if not exists public.home_banner_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists product_images_product_order_idx
  on public.product_images(product_id, sort_order);
create index if not exists product_information_product_order_idx
  on public.product_information(product_id, display_order);
create index if not exists product_faqs_product_order_idx
  on public.product_faqs(product_id, display_order);
create index if not exists global_faqs_order_idx on public.global_faqs(display_order);
create index if not exists reviews_product_approved_idx
  on public.reviews(product_id, is_approved, created_at desc);
create index if not exists hero_slides_active_order_idx
  on public.hero_slides(position, is_active, display_order);
create index if not exists home_banner_images_active_order_idx
  on public.home_banner_images(is_active, display_order);
create index if not exists contact_inquiries_status_created_idx
  on public.contact_inquiries(status, created_at desc);

alter table public.product_images enable row level security;
alter table public.product_information enable row level security;
alter table public.product_faqs enable row level security;
alter table public.global_faqs enable row level security;
alter table public.reviews enable row level security;
alter table public.hero_slides enable row level security;
alter table public.home_banner_images enable row level security;
alter table public.announcements enable row level security;
alter table public.contact_inquiries enable row level security;

drop policy if exists "Public reads product images" on public.product_images;
create policy "Public reads product images" on public.product_images
for select to anon, authenticated using (true);
drop policy if exists "Public reads product information" on public.product_information;
create policy "Public reads product information" on public.product_information
for select to anon, authenticated using (true);
drop policy if exists "Public reads product FAQs" on public.product_faqs;
create policy "Public reads product FAQs" on public.product_faqs
for select to anon, authenticated using (true);
drop policy if exists "Public reads global FAQs" on public.global_faqs;
create policy "Public reads global FAQs" on public.global_faqs
for select to anon, authenticated using (true);
drop policy if exists "Public reads approved reviews" on public.reviews;
create policy "Public reads approved reviews" on public.reviews
for select to anon, authenticated using (is_approved or user_id = (select auth.uid()));
drop policy if exists "Customers submit reviews" on public.reviews;
create policy "Customers submit reviews" on public.reviews
for insert to authenticated with check (user_id = (select auth.uid()) and not is_approved);
drop policy if exists "Public reads active hero slides" on public.hero_slides;
create policy "Public reads active hero slides" on public.hero_slides
for select to anon, authenticated using (is_active);
drop policy if exists "Public reads active home banners" on public.home_banner_images;
create policy "Public reads active home banners" on public.home_banner_images
for select to anon, authenticated using (is_active);
drop policy if exists "Public reads active announcements" on public.announcements;
create policy "Public reads active announcements" on public.announcements
for select to anon, authenticated using (is_active);
drop policy if exists "Public submits contact inquiries" on public.contact_inquiries;
create policy "Public submits contact inquiries" on public.contact_inquiries
for insert to anon, authenticated with check (status = 'unread');

revoke insert, update, delete on public.product_images from anon, authenticated;
revoke insert, update, delete on public.product_information from anon, authenticated;
revoke insert, update, delete on public.product_faqs from anon, authenticated;
revoke insert, update, delete on public.global_faqs from anon, authenticated;
revoke update, delete on public.reviews from anon, authenticated;
revoke insert, update, delete on public.hero_slides from anon, authenticated;
revoke insert, update, delete on public.home_banner_images from anon, authenticated;
revoke insert, update, delete on public.announcements from anon, authenticated;
revoke select, update, delete on public.contact_inquiries from anon, authenticated;
