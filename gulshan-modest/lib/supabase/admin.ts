import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with the service role key.
 * This bypasses RLS and should only be used in server-side contexts
 * such as admin seeding, cron jobs, or backend operations.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
