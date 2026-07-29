'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult = {
  error?: string
  success?: boolean
}

export async function submitReview(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'You must be logged in to submit a review.' }
    }

    const productId = formData.get('product_id') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string

    if (!productId) {
      return { error: 'Product ID is required.' }
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { error: 'Please select a valid rating between 1 and 5.' }
    }

    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        id: crypto.randomUUID(),
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment ? comment.trim() : null,
        is_approved: false // Reviews must be approved by admin
      })

    if (insertError) {
      console.error('Error submitting review:', insertError)
      return { error: 'Failed to submit review. Please try again later.' }
    }

    revalidatePath(`/product/[slug]`)
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error submitting review:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
