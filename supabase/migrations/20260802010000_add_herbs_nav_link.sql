-- Add "Herbs" to the header navigation, alongside Products and Categories.
-- Idempotent: safe to run more than once.
insert into public.navigation_links (location, label, href, display_order)
select 'header', 'Herbs', '/herbs', 25
where not exists (
  select 1 from public.navigation_links
  where location = 'header' and href = '/herbs'
);
