'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { isValidIndianPhone, normalizeIndianPhone } from '@/lib/local-customer'

export type ActionResult = {
  error?: string
  success?: boolean
}

export async function submitReview(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const productId = formData.get('product_id') as string
    const orderNumber = (formData.get('order_number') as string | null)?.trim()
    const customerName = (formData.get('customer_name') as string | null)?.trim()
    const customerPhone = normalizeIndianPhone(
      (formData.get('customer_phone') as string | null) || ''
    )
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string

    if (!productId) {
      return { error: 'Product ID is required.' }
    }
    if (
      !orderNumber ||
      !/^PAN-[A-Z0-9]{6,20}$/.test(orderNumber) ||
      !customerName ||
      !isValidIndianPhone(customerPhone)
    ) {
      return { error: 'Log in with the mobile number used for a known order before reviewing.' }
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { error: 'Please select a valid rating between 1 and 5.' }
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Review submission is not configured.' }
    }

    const admin = createAdminClient()
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .eq('customer_phone', customerPhone)
      .maybeSingle()
    if (orderError || !order) {
      return { error: 'This order could not be matched to your mobile number.' }
    }

    const { data: orderedItem } = await admin
      .from('order_items')
      .select('id')
      .eq('order_id', order.id)
      .eq('product_id', productId)
      .limit(1)
      .maybeSingle()
    if (!orderedItem) {
      return { error: 'This product was not found in the selected order.' }
    }

    const { error: insertError } = await admin
      .from('reviews')
      .insert({
        id: crypto.randomUUID(),
        product_id: productId,
        user_id: null,
        order_id: order.id,
        customer_name: customerName.slice(0, 80),
        customer_phone: customerPhone,
        rating,
        comment: comment ? comment.trim() : null,
        is_approved: false // Reviews must be approved by admin
      })

    if (insertError) {
      console.error('Error submitting review:', insertError)
      return {
        error: insertError.code === '23505'
          ? 'You have already reviewed this product for that order.'
          : 'Failed to submit review. Please try again later.'
      }
    }

    revalidatePath(`/shop/${productId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error submitting review:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
