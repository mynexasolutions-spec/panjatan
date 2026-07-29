-- Panjatan Ayurveda storefront CMS.
-- This migration is intentionally independent from commerce/checkout migrations.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id text primary key default 'global',
  site_name text not null,
  tagline text not null default '',
  support_email text not null default '',
  support_phone text not null default '',
  whatsapp_number text not null default '',
  whatsapp_message text not null default '',
  business_hours text not null default '',
  address text not null default '',
  announcement_text text not null default '',
  shop_banner_title text not null default '',
  shop_banner_description text not null default '',
  facebook_url text,
  instagram_url text,
  youtube_url text,
  default_seo_title text not null default '',
  default_seo_description text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  eyebrow text not null default '',
  summary text not null default '',
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  seo_title text not null default '',
  seo_description text not null default '',
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  heading text not null default '',
  subheading text not null default '',
  body text not null default '',
  image_url text,
  link_label text,
  link_url text,
  is_visible boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.homepage_sections(id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  body text not null default '',
  image_url text,
  link_url text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  is_visible boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.navigation_links (
  id uuid primary key default gen_random_uuid(),
  location text not null check (location in ('header', 'footer', 'legal')),
  label text not null,
  href text not null,
  is_external boolean not null default false,
  is_visible boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text not null default 'footer',
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index if not exists homepage_sections_order_idx
  on public.homepage_sections(is_visible, display_order);
create index if not exists homepage_section_items_order_idx
  on public.homepage_section_items(section_id, is_visible, display_order);
create index if not exists navigation_links_location_order_idx
  on public.navigation_links(location, is_visible, display_order);
create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers(status, subscribed_at desc);
create unique index if not exists newsletter_subscribers_email_unique_idx
  on public.newsletter_subscribers(lower(email));

insert into public.site_settings (
  id, site_name, tagline, support_email, support_phone, whatsapp_number,
  whatsapp_message, business_hours, address, announcement_text,
  shop_banner_title, shop_banner_description, facebook_url, instagram_url,
  youtube_url, default_seo_title, default_seo_description
) values (
  'global',
  'Panjatan Ayurveda',
  'Pure Ayurvedic Medicines for a Healthy Today & Better Tomorrow',
  'care@panjatanayurveda.com',
  '+91 73000 70707',
  '917300070707',
  'Hi Panjatan Ayurveda! I would like to inquire about your Ayurvedic products.',
  'Mon - Sat: 10:00 AM - 6:00 PM',
  'India',
  'Free Delivery on orders above ₹499',
  'Explore Ayurvedic Wellness',
  'Discover safe, effective and natural formulations for everyday health.',
  'https://facebook.com',
  'https://instagram.com',
  'https://youtube.com',
  'Panjatan Ayurveda | Pure Ayurvedic Medicines for Healthy Living',
  'Safe, effective, and 100% natural Ayurvedic health products and herbal medicines.'
) on conflict (id) do nothing;

insert into public.content_pages
  (slug, title, eyebrow, summary, blocks, seo_title, seo_description)
values
  (
    'about', 'About Panjatan Ayurveda', 'Our Heritage',
    'Natural healthcare rooted in the timeless wisdom of Ayurveda.',
    '[{"heading":"Our Story","body":"Panjatan Ayurveda is committed to providing safe, effective and natural healthcare through the timeless wisdom of Ayurveda. Our products are manufactured in GMP and ISO certified units using carefully selected herbs."},{"heading":"Our Promise","body":"We combine authentic formulations, responsible manufacturing and modern quality controls to make Ayurvedic wellness accessible."}]',
    'About Us | Panjatan Ayurveda',
    'Learn about Panjatan Ayurveda and our commitment to safe, effective, natural healthcare.'
  ),
  (
    'contact', 'Contact Us', 'Here to Help',
    'Have a product or order question? Our care team will be happy to assist you.',
    '[{"heading":"Customer Care","body":"Contact us by email, phone or WhatsApp during business hours."}]',
    'Contact Us | Panjatan Ayurveda',
    'Get in touch with Panjatan Ayurveda for product queries, orders, or feedback.'
  ),
  (
    'privacy', 'Privacy Policy', '',
    'How Panjatan Ayurveda collects, uses and protects personal information.',
    '[{"heading":"Information We Collect","body":"We collect information needed to provide the storefront, respond to support requests and fulfil orders."},{"heading":"How We Use Information","body":"We use information to provide services, communicate with you, prevent fraud and meet legal obligations."},{"heading":"Contact Us","body":"Questions about privacy can be sent to care@panjatanayurveda.com."}]',
    'Privacy Policy | Panjatan Ayurveda', 'Panjatan Ayurveda privacy policy.'
  ),
  (
    'refund', 'Refund & Cancellation Policy', '',
    'Cancellation, return and refund information for Panjatan Ayurveda orders.',
    '[{"heading":"Cancellations","body":"Contact our support team as soon as possible if you need to cancel an order."},{"heading":"Returns","body":"Eligible unopened and unused products may be returned within the period shown on your order terms."},{"heading":"Refunds","body":"Approved refunds are returned using the applicable order payment process."}]',
    'Refund & Cancellation Policy | Panjatan Ayurveda', 'Panjatan Ayurveda refund and cancellation policy.'
  ),
  (
    'shipping', 'Shipping & Delivery Policy', '',
    'Processing, dispatch, delivery and tracking information.',
    '[{"heading":"Processing Time","body":"Standard orders are prepared for dispatch within 2-3 business days."},{"heading":"Delivery","body":"Delivery timelines vary by destination and begin after dispatch."},{"heading":"Tracking","body":"Tracking details are shared when an order is dispatched."}]',
    'Shipping & Delivery Policy | Panjatan Ayurveda', 'Panjatan Ayurveda shipping and delivery policy.'
  ),
  (
    'terms', 'Terms & Conditions', '',
    'Terms that apply when using the Panjatan Ayurveda website.',
    '[{"heading":"Online Store Terms","body":"Use this website only for lawful purposes and provide accurate account and order information."},{"heading":"Products and Services","body":"Availability, descriptions and prices may be updated without notice."},{"heading":"Orders","body":"We may reject or cancel an order where required for stock, security or legal reasons."}]',
    'Terms & Conditions | Panjatan Ayurveda', 'Panjatan Ayurveda website terms and conditions.'
  )
on conflict (slug) do nothing;

insert into public.homepage_sections
  (section_key, heading, subheading, body, link_label, link_url, display_order)
values
  ('hero', 'Heal Naturally with Panjatan Ayurveda',
   'Pure Ayurvedic Medicines for a Healthy Today & Better Tomorrow',
   'Authentic Ayurveda supported by modern quality standards.', 'Shop Now', '/shop', 0),
  ('feature-bar', '', '', '', null, null, 10),
  ('story', 'About Panjatan Ayurveda', 'Authentic Formulations',
   'Safe, effective and natural healthcare through the timeless wisdom of Ayurveda.',
   'Know More About Us', '/about', 20),
  ('categories', 'Shop by Health Category', '', '', null, null, 30),
  ('featured-products', 'Featured Products', 'Ayurvedic wellness selected for everyday care.', '', null, null, 35),
  ('why-us', 'Why Choose Panjatan Ayurveda?', '',
   'Natural ingredients, responsible manufacturing and quality you can trust.',
   null, null, 40),
  ('goodness-of-nature', 'Goodness of Nature in Every Product', '', '',
   'Explore Ingredients', '/shop', 50),
  ('testimonials', 'What Our Customers Say', '',
   'Experiences shared by the Panjatan Ayurveda community.', null, null, 60),
  ('certifications', 'Quality & Certifications', '',
   'Manufactured with strict quality and safety standards.', null, null, 70)
on conflict (section_key) do nothing;

insert into public.homepage_section_items
  (section_id, title, subtitle, body, display_order)
select id, item.title, item.subtitle, '', item.display_order
from public.homepage_sections
cross join lateral (values
  ('Organic Herbs', 'Carefully Sourced', 0),
  ('Expert Formulated', 'Ayurvedic Experts', 10),
  ('Safe & Natural', 'No Harmful Chemicals', 20),
  ('Fast Delivery', 'Pan India', 30)
) as item(title, subtitle, display_order)
where section_key = 'feature-bar'
  and not exists (select 1 from public.homepage_section_items where section_id = homepage_sections.id);

insert into public.homepage_section_items
  (section_id, title, subtitle, body, display_order)
select id, item.title, '', '', item.display_order
from public.homepage_sections
cross join lateral (values
  ('Amla', 0), ('Giloy', 10), ('Ashwagandha', 20), ('Kalmegh', 30),
  ('Tulsi', 40), ('Neem', 50), ('Harad', 60)
) as item(title, display_order)
where section_key = 'goodness-of-nature'
  and not exists (select 1 from public.homepage_section_items where section_id = homepage_sections.id);

insert into public.homepage_section_items
  (section_id, title, subtitle, body, display_order)
select id, item.title, item.subtitle, item.body, item.display_order
from public.homepage_sections
cross join lateral (values
  ('100% Ayurvedic', 'Natural formulations', 'Prepared with carefully selected Ayurvedic ingredients.', 0),
  ('GMP Certified', 'Quality manufacturing', 'Made in facilities following good manufacturing practices.', 10),
  ('ISO Certified', 'Verified systems', 'Quality systems designed for consistency and safety.', 20)
) as item(title, subtitle, body, display_order)
where section_key = 'why-us'
  and not exists (select 1 from public.homepage_section_items where section_id = homepage_sections.id);

insert into public.homepage_section_items
  (section_id, title, subtitle, body, metadata, display_order)
select id, item.title, '', item.body, jsonb_build_object('rating', 5), item.display_order
from public.homepage_sections
cross join lateral (values
  ('Rahul Sharma', 'Pachan Plus has been a helpful addition to my daily wellness routine.', 0),
  ('Neha Verma', 'Natural products, clear information and a smooth ordering experience.', 10),
  ('Mohd. Imran', 'The product quality and customer support have been dependable.', 20)
) as item(title, body, display_order)
where section_key = 'testimonials'
  and not exists (select 1 from public.homepage_section_items where section_id = homepage_sections.id);

insert into public.homepage_section_items
  (section_id, title, subtitle, body, display_order)
select id, item.title, '', '', item.display_order
from public.homepage_sections
cross join lateral (values
  ('GMP Certified', 0), ('ISO Company', 10), ('AYUSH', 20),
  ('Make in India', 30), ('100% Ayurvedic', 40)
) as item(title, display_order)
where section_key = 'certifications'
  and not exists (select 1 from public.homepage_section_items where section_id = homepage_sections.id);

insert into public.navigation_links (location, label, href, display_order) values
  ('header', 'Home', '/', 0),
  ('header', 'Products', '/shop', 10),
  ('header', 'Categories', '/#categories', 20),
  ('header', 'About Us', '/about', 30),
  ('header', 'Contact', '/contact', 40),
  ('footer', 'Home', '/', 0),
  ('footer', 'Products', '/shop', 10),
  ('footer', 'About Us', '/about', 20),
  ('footer', 'Contact Us', '/contact', 30),
  ('legal', 'Privacy Policy', '/policies/privacy', 0),
  ('legal', 'Terms & Conditions', '/policies/terms', 10),
  ('legal', 'Returns & Refunds', '/policies/refund', 20),
  ('legal', 'Shipping', '/policies/shipping', 30)
on conflict do nothing;

alter table public.site_settings enable row level security;
alter table public.content_pages enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.homepage_section_items enable row level security;
alter table public.navigation_links enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Public reads site settings" on public.site_settings;
create policy "Public reads site settings" on public.site_settings for select using (true);
drop policy if exists "Public reads published content pages" on public.content_pages;
create policy "Public reads published content pages" on public.content_pages
  for select using (is_published);
drop policy if exists "Public reads visible homepage sections" on public.homepage_sections;
create policy "Public reads visible homepage sections" on public.homepage_sections
  for select using (is_visible);
drop policy if exists "Public reads visible homepage items" on public.homepage_section_items;
create policy "Public reads visible homepage items" on public.homepage_section_items
  for select using (is_visible);
drop policy if exists "Public reads visible navigation" on public.navigation_links;
create policy "Public reads visible navigation" on public.navigation_links
  for select using (is_visible);
drop policy if exists "Public subscribes to newsletter" on public.newsletter_subscribers;
create policy "Public subscribes to newsletter" on public.newsletter_subscribers
  for insert with check (status = 'active');

grant select on public.site_settings, public.content_pages,
  public.homepage_sections, public.homepage_section_items,
  public.navigation_links to anon, authenticated;
grant insert (email, source) on public.newsletter_subscribers to anon, authenticated;
grant all on public.site_settings, public.content_pages, public.homepage_sections,
  public.homepage_section_items, public.navigation_links,
  public.newsletter_subscribers to service_role;
