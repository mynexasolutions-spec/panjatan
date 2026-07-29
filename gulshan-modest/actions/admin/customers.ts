'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '@/lib/admin-session'

export type AdminActionResult = {
  error?: string
  success?: boolean
}

export async function getCustomers() {
  const supabase = await createClient()

  if (!(await isAdminAuthenticated())) return []

  // Fetch customers
  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return customers || []
}

export async function toggleCustomerStatus(
  id: string,
  isActive: boolean
): Promise<AdminActionResult> {
  const supabase = await createClient()

  if (!(await isAdminAuthenticated())) return { error: 'Unauthorized' }

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
