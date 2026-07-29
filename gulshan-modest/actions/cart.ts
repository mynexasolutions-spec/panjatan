'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type CartSyncItem = {
  variantId?: string
  productId?: string
  quantity: number
}

type CartActionResult = {
  success: boolean
  error?: string
  requiresLogin?: boolean
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function getAuthenticatedCartClient() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user || !UUID_PATTERN.test(user.id)) return null
  return { user, db: createAdminClient() }
}

export async function addToCart(variantId: string, quantity: number = 1) {
  const authenticated = await getAuthenticatedCartClient()
  if (!authenticated) {
    return { success: false, error: 'Please log in to add items to your cart.', requiresLogin: true }
  }

  const { error } = await authenticated.db.rpc('merge_cart', {
    user_id_input: authenticated.user.id,
    items_input: [{
      variantId,
      quantity: Math.max(1, Math.min(99, Math.floor(quantity))),
    }],
  })
  if (error) return { success: false, error: error.message }

  revalidatePath('/cart')
  return { success: true }
}

export async function mergeGuestCart(items: CartSyncItem[]): Promise<CartActionResult> {
  const authenticated = await getAuthenticatedCartClient()
  if (!authenticated) {
    return { success: false, error: 'Not logged in', requiresLogin: true }
  }

  const normalized: Array<{ variantId: string; quantity: number }> = []
  for (const item of items) {
    let variantId = item.variantId
    if (!variantId && item.productId && /^\d+$/.test(item.productId)) {
      const { data: fallbackVariant } = await authenticated.db
        .from('product_variants')
        .select('id')
        .eq('product_id', Number(item.productId))
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      variantId = fallbackVariant?.id
    }
    if (!variantId || !UUID_PATTERN.test(variantId)) {
      return {
        success: false,
        error: 'A saved cart item is no longer available. Your local cart was preserved.',
      }
    }
    normalized.push({
      variantId,
      quantity: Math.max(1, Math.min(99, Math.floor(item.quantity))),
    })
  }

  const { error } = await authenticated.db.rpc('merge_cart', {
    user_id_input: authenticated.user.id,
    items_input: normalized,
  })
  if (error) return { success: false, error: error.message }

  revalidatePath('/checkout')
  return { success: true }
}

export async function removeFromCart(cartItemId: string) {
  const authenticated = await getAuthenticatedCartClient()
  if (!authenticated) return { success: false, error: 'Unauthorized' }

  const { error } = await authenticated.db
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', authenticated.user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/cart')
  return { success: true }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const authenticated = await getAuthenticatedCartClient()
  if (!authenticated) return { success: false, error: 'Unauthorized' }

  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  const { error } = await authenticated.db
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', authenticated.user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/cart')
  return { success: true }
}

export async function clearCart() {
  const authenticated = await getAuthenticatedCartClient()
  if (!authenticated) return { success: false, error: 'Unauthorized' }

  const { error } = await authenticated.db
    .from('cart_items')
    .delete()
    .eq('user_id', authenticated.user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/checkout')
  return { success: true }
}

export async function getCart() {
  const authenticated = await getAuthenticatedCartClient()
  if (!authenticated) {
    return { success: false, error: 'Not logged in', items: [] }
  }

  const { data, error } = await authenticated.db
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
          image_url,
          featured_image_url
        )
      )
    `)
    .eq('user_id', authenticated.user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message, items: [] }

  const items = (data || []).flatMap((row: any) => {
    const variant = Array.isArray(row.product_variants)
      ? row.product_variants[0]
      : row.product_variants
    const product = Array.isArray(variant?.products)
      ? variant.products[0]
      : variant?.products

    if (!variant || !product || variant.is_active === false) return []

    return [{
      cartItemId: row.id,
      id: String(product.id),
      name: product.name,
      price: Number(variant.price),
      image_url: product.featured_image_url || product.image_url || '/image.png',
      quantity: Number(row.quantity),
      variant_id: variant.id,
      variant_name: variant.variant_name,
    }]
  })

  return { success: true, items }
}

export async function getCartCount() {
  const authenticated = await getAuthenticatedCartClient()
  if (!authenticated) return 0

  const { data } = await authenticated.db
    .from('cart_items')
    .select('quantity')
    .eq('user_id', authenticated.user.id)

  if (!data) return 0

  return data.reduce((sum, item) => sum + item.quantity, 0)
}
