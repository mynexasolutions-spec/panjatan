'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Razorpay from 'razorpay'
import crypto from 'crypto'


// Initialize Razorpay
// We wrap this in a try-catch or check to avoid crashing if keys are missing
let razorpayInstance: any = null
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
} catch (e) {
  console.warn("Razorpay credentials missing or invalid")
}

export async function createOrder(addressId: string, paymentMethod: string, cartItemsFromFrontend: any[]) {
  const supabase = await createClient()

  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // 2. Validate Address
  const { data: address } = await supabase
    .from('addresses')
    .select('id')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!address) return { success: false, error: 'Invalid shipping address' }

  if (!cartItemsFromFrontend || cartItemsFromFrontend.length === 0) {
    return { success: false, error: 'Your cart is empty in the database.' }
  }

  // 4. Calculate totals securely (Using frontend data for mock compatibility)
  let subtotal = 0
  const orderItems = []

  for (const item of cartItemsFromFrontend) {
    const price = Number(item.price)
    const quantity = Number(item.quantity)
    const lineTotal = price * quantity

    subtotal += lineTotal

    orderItems.push({
      product_id: item.id,
      variant_id: item.variant_id || item.id,
      product_name: item.name,
      variant_name: item.variant_name || 'Default',
      price_at_purchase: price,
      quantity: quantity,
      line_total: lineTotal
    })
  }

  // Fetch shipping settings from DB
  const { data: settingsData } = await supabase
    .from('settings')
    .select('shipping')
    .single()

  const shippingSettings = settingsData?.shipping || {
    flat_rate: 99,
    free_threshold: 1999,
    cod_charge: 50,
    online_discount: 0
  }

  const flatRate = Number(shippingSettings.flat_rate ?? 99)
  const freeThreshold = Number(shippingSettings.free_threshold ?? 1999)
  const codCharge = Number(shippingSettings.cod_charge ?? 50)
  const onlineDiscountPercent = Number(shippingSettings.online_discount ?? 0)

  const shipping_cost = subtotal >= freeThreshold ? 0 : flatRate
  const cod_cost = paymentMethod === 'COD' ? codCharge : 0
  const online_discount_amount = paymentMethod === 'RAZORPAY'
    ? Math.round((subtotal * onlineDiscountPercent) / 100)
    : 0
  const total_amount = subtotal + shipping_cost + cod_cost - online_discount_amount

  // Generate order number
  const order_number = `AM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  const actualPaymentMethod = paymentMethod === 'RAZORPAY' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'

  // 5. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      order_number,
      user_id: user.id,
      address_id: addressId,
      subtotal,
      shipping_cost,
      total_amount,
      payment_status: 'pending',
      order_status: 'pending',
      payment_method: actualPaymentMethod
    }])
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    return { success: false, error: orderError?.message || 'Failed to create order' }
  }

  // 6. Insert Order Items
  const itemsToInsert = orderItems.map(item => ({
    ...item,
    order_id: order.id
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Failed to insert order items:', itemsError)
    return { success: false, error: 'Failed to create order items' }
  }

  // 7. Handle Payment Method Specific Logic
  if (paymentMethod === 'RAZORPAY') {
    if (!razorpayInstance) {
      return { success: false, error: 'Razorpay is not configured on the server.' }
    }

    try {
      // Create Razorpay Order
      // amount is in paise (multiply by 100)
      const options = {
        amount: Math.round(total_amount * 100),
        currency: 'INR',
        receipt: order.id,
        payment_capture: 1
      }
      
      const rzpOrder = await razorpayInstance.orders.create(options)

      return { 
        success: true, 
        isRazorpay: true, 
        razorpayOrderId: rzpOrder.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: options.amount
      }
    } catch (err: any) {
      console.error('Razorpay Error:', err)
      return { success: false, error: 'Failed to initialize payment gateway.' }
    }
  }

  // If COD, clear cart, decrement stock, and finish
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  for (const item of orderItems) {
    // Wrap in try-catch because mock IDs (e.g. 'p1') will fail UUID cast in Postgres
    try {
      const { data: variant } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single()
      if (variant) {
        await supabase.from('product_variants').update({
          stock_quantity: Math.max(0, variant.stock_quantity - item.quantity)
        }).eq('id', item.variant_id)
      }
    } catch (e) {
      console.warn('Skipping stock decrement for mock variant:', item.variant_id)
    }
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')
  revalidatePath('/profile')

  return { success: true, isRazorpay: false, order_number: order.order_number, orderId: order.id }
}

export async function verifyRazorpayPayment(
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string,
  internal_order_id: string
) {
  // We MUST use the Admin client here to securely bypass RLS
  // because users should NOT have UPDATE permissions on their orders directly.
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()
  const userSupabase = await createClient()

  // 1. Get user securely via regular client to confirm they are logged in
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // 2. Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return { success: false, error: 'Razorpay secret not configured' }

  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex')

  if (generated_signature !== razorpay_signature) {
    return { success: false, error: 'Payment verification failed: Invalid signature' }
  }

  // 3. Update Order Status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', internal_order_id)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Failed to update order status:', updateError)
    return { success: false, error: 'Failed to update order status' }
  }

  // 4. Get order items to decrement stock
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', internal_order_id)

  if (orderItems) {
    for (const item of orderItems) {
      if (!item.variant_id) continue
      const { data: variant } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single()
      if (variant) {
        await supabase.from('product_variants').update({
          stock_quantity: Math.max(0, variant.stock_quantity - item.quantity)
        }).eq('id', item.variant_id)
      }
    }
  }

  // 5. Clear Cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  revalidatePath('/cart')
  revalidatePath('/checkout')
  revalidatePath('/profile')

  return { success: true }
}

export async function processCheckout(
  profile: { fullName: string, email: string, phone: string, alternatePhone?: string, street: string, city: string, state: string, zipCode: string },
  items: any[],
  paymentMethod: 'COD' | 'RAZORPAY'
) {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'You must be logged in to checkout.' }

  // 1. Create or get address
  let addressId = ''
  const { data: existingAddress } = await supabase
    .from('addresses')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingAddress) {
    // Update existing address
    await supabase.from('addresses').update({
      full_name: profile.fullName,
      phone: profile.phone,
      alternate_phone: profile.alternatePhone || null,
      address_line_1: profile.street,
      city: profile.city,
      state: profile.state,
      postal_code: profile.zipCode,
      country: 'India'
    }).eq('id', existingAddress.id)
    addressId = existingAddress.id
  } else {
    const { data: newAddress, error: addressError } = await supabase.from('addresses').insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      full_name: profile.fullName,
      phone: profile.phone,
      alternate_phone: profile.alternatePhone || null,
      address_line_1: profile.street,
      city: profile.city,
      state: profile.state,
      postal_code: profile.zipCode,
      country: 'India',
      is_default: true
    }).select('id').single()

    if (addressError || !newAddress) {
      console.error('ADDRESS ERROR:', addressError)
      return { success: false, error: addressError?.message || 'Failed to save address.' }
    }
    addressId = newAddress.id
  }

  // 2. Sync cart items to DB
  // Clear existing cart
  await supabase.from('cart_items').delete().eq('user_id', user.id)
  
  // Insert new cart items
  const cartInserts = items.map(item => ({
    user_id: user.id,
    variant_id: item.variant_id || item.id, // Use variant_id directly, fallback to product id if needed
    quantity: item.quantity
  }))
  
  const { error: cartError } = await supabase.from('cart_items').insert(cartInserts)
  if (cartError) {
    console.error('CART SYNC ERROR:', cartError)
    return { success: false, error: cartError.message || 'Failed to sync cart.' }
  }

  // 3. Call createOrder (pass items from memory to avoid join errors)
  return await createOrder(addressId, paymentMethod, items)
}
