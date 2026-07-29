'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminClient } from '@/lib/supabase/admin'

export async function getInquiries() {
  const adminClient = await requireAdminClient()
  if (!adminClient) return []

  const { data } = await adminClient
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

export async function markInquiryAsRead(id: string) {
  const adminClient = await requireAdminClient()
  if (!adminClient) return { success: false, error: 'Unauthorized' }

  const { error } = await adminClient
    .from('contact_inquiries')
    .update({ status: 'read' })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

export async function deleteInquiry(id: string) {
  const adminClient = await requireAdminClient()
  if (!adminClient) return { success: false, error: 'Unauthorized' }

  const { error } = await adminClient
    .from('contact_inquiries')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}
