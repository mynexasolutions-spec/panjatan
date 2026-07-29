'use server'

import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '@/lib/admin-session'

export async function updateOrderStatus(orderId: string, status: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const updateData: any = { order_status: status }
  
  // Set timestamps based on new status
  if (status === 'shipped') updateData.shipped_at = new Date().toISOString()
  if (status === 'delivered') updateData.delivered_at = new Date().toISOString()
  if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const updateData: any = { payment_status: status }
  
  // Set timestamps based on new status
  if (status === 'paid') updateData.paid_at = new Date().toISOString()

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}
