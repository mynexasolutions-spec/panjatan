'use server'

import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '@/lib/admin-session'

export async function getInquiries() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return []

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

export async function markInquiryAsRead(id: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('contact_inquiries')
    .update({ status: 'read' })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

export async function deleteInquiry(id: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('contact_inquiries')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}
