'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToCart(variantId: string, quantity: number = 1) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Please log in to add items to your cart.', requiresLogin: true }
  }

  // Check if this variant already exists in the user's cart
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('variant_id', variantId)
    .single()

  if (existing) {
    // Update quantity
    const newQty = existing.quantity + quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    // Insert new
    const { error } = await supabase
      .from('cart_items')
      .insert([{ user_id: user.id, variant_id: variantId, quantity }])

    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/cart')
  return { success: true }
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/cart')
  return { success: true }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/cart')
  return { success: true }
}

export async function getCart() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not logged in', items: [] }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      variant_id,
      product_variants (
        id,
        variant_name,
        price,
        original_price,
        stock_quantity,
        is_active,
        product_id,
        products (
          id,
          name,
          slug,
          featured_image_url
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message, items: [] }

  return { success: true, items: data || [] }
}

export async function getCartCount() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', user.id)

  if (!data) return 0

  return data.reduce((sum, item) => sum + item.quantity, 0)
}
