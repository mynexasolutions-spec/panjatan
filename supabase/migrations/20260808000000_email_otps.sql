-- One-time-password store for email verification flows.
-- Used by:
--   * actions/auth.ts (sendEmailOtp/verifyEmailOtp) via the anon-key server client
--   * actions/checkout-email.ts (guest checkout email verification) via the service-role admin client
-- Table did not previously exist, so both flows were unusable before this migration.

create table if not exists public.email_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp text not null,
  full_name text,
  purpose text not null default 'login',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint email_otps_email_check check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  constraint email_otps_otp_check check (otp ~ '^[0-9]{6}$')
);

create index if not exists email_otps_email_idx on public.email_otps(email);
create index if not exists email_otps_expires_at_idx on public.email_otps(expires_at);

alter table public.email_otps enable row level security;
revoke all on table public.email_otps from public;

-- Existing account-auth flow (actions/auth.ts) issues these queries with the
-- anon-key server client (no elevated Postgres role), so anon/authenticated
-- need direct access. Rows are short-lived (10 min) and scoped by exact
-- email match; there is no listing/enumeration endpoint.
grant select, insert, delete on table public.email_otps to anon, authenticated;

drop policy if exists "email_otps_anon_all" on public.email_otps;
create policy "email_otps_anon_all"
  on public.email_otps
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- The guest-checkout flow uses the service-role admin client, which bypasses
-- RLS entirely, so no additional policy is required for it.
grant select, insert, delete on table public.email_otps to service_role;
