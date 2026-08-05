'use server'

import { requireAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type AdminActionResult = {
  error?: string
  success?: boolean
}

export type AdminCustomer = {
  id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  is_active: boolean
  customer_type: 'account' | 'device'
  order_count: number
}

export async function getCustomers() {
  const supabase = await requireAdminClient()
  if (!supabase) return []

  // Select '*' rather than naming columns explicitly: the `phone` and
  // `is_active` columns are only present on profiles after the migration in
  // supabase/migrations/add_profile_phone_is_active.sql has been run. Naming
  // them directly makes PostgREST error out and silently drops every account
  // customer from this list on databases where that migration hasn't run yet.
  const [profilesResult, guestsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer'),
    supabase
      .from('guest_customers')
      .select('phone, full_name, created_at, order_count'),
  ])

  if (profilesResult.error) console.error('Unable to load account customers:', profilesResult.error.message)
  if (guestsResult.error) console.error('Unable to load device customers:', guestsResult.error.message)

  const accounts: AdminCustomer[] = (profilesResult.data || []).map((customer: any) => ({
    id: customer.id,
    full_name: customer.full_name || 'Customer',
    email: customer.email || '',
    phone: customer.phone ?? null,
    created_at: customer.created_at,
    is_active: customer.is_active !== false,
    customer_type: 'account',
    order_count: 0,
  }))
  const devices: AdminCustomer[] = (guestsResult.data || []).map((customer) => ({
    id: `guest:${customer.phone}`,
    full_name: customer.full_name,
    email: '',
    phone: customer.phone,
    created_at: customer.created_at,
    is_active: true,
    customer_type: 'device',
    order_count: customer.order_count || 0,
  }))

  return [...accounts, ...devices].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function toggleCustomerStatus(
  id: string,
  isActive: boolean
): Promise<AdminActionResult> {
  const supabase = await requireAdminClient()
  if (!supabase) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('role', 'customer')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/customers')
  return { success: true }
}
