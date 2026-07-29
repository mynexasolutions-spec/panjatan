import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/admin-session'

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

/**
 * Returns a service-role client only after validating the signed, httpOnly
 * Panjatan admin session. Server actions must use this helper rather than
 * relying on the admin layout or a browser-supplied Supabase identity.
 */
export async function requireAdminClient() {
  const session = await getAdminSession()
  if (!session) return null

  return createAdminClient()
}
