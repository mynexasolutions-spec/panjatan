-- Split the homepage hero banner into separate desktop/PC and mobile image
-- sets so the storefront hero can be replaced by a full-width, admin-managed,
-- auto-sliding banner (rather than the old two-column text+image hero).

alter table public.home_banner_images
  add column if not exists device_type text not null default 'desktop'
    check (device_type in ('desktop', 'mobile'));

create index if not exists home_banner_images_device_active_order_idx
  on public.home_banner_images(device_type, is_active, display_order);
