'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminClient } from '@/lib/supabase/admin'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const PAYMENT_STATUSES = ['pending', 'simulated', 'paid', 'failed', 'refunded'] as const

export async function updateOrderStatus(orderId: string, status: string) {
  const adminClient = await requireAdminClient()
  if (!adminClient) return { success: false, error: 'Unauthorized' }
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { success: false, error: 'Unsupported order status' }
  }

  // The database function locks the order and restores inventory exactly once
  // when it is cancelled.
  const { error } = await adminClient.rpc('set_order_status', {
    order_id_input: orderId,
    status_input: status,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  const adminClient = await requireAdminClient()
  if (!adminClient) return { success: false, error: 'Unauthorized' }
  if (!PAYMENT_STATUSES.includes(status as (typeof PAYMENT_STATUSES)[number])) {
    return { success: false, error: 'Unsupported payment status' }
  }

  const updateData: { payment_status: string; paid_at?: string } = {
    payment_status: status,
  }
  
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
