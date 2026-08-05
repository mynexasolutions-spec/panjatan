-- The admin Customers page (actions/admin/customers.ts, types/database.ts
-- Profile type) has always assumed public.profiles has `phone` and
-- `is_active` columns, but the live schema does not have them. This made
-- the account-customers query error out and silently return zero rows,
-- and made the Suspend/Activate button fail. Add the columns the app
-- already expects; both are additive and safe to run on the live DB.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
