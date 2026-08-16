'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID, createHmac } from 'crypto'
import { revalidatePath } from 'next/cache'
import { isValidEmail, isValidIndianPhone, normalizeIndianPhone } from '@/lib/local-customer'
import type { LocalAddress, LocalOrder } from '@/lib/local-customer'
import { getCustomerSession } from '@/lib/customer-session'

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return null

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Razorpay = require('razorpay')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export async function isRazorpayEnabled(): Promise<boolean> {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

export type CheckoutPaymentMethod = 'COD' | 'ONLINE'
export type CheckoutPaymentStatus = 'pending' | 'simulated' | 'paid' | 'failed'

export type CheckoutProfile = {
  fullName: string
  phone: string
  alternatePhone?: string
  email: string
  street: string
  city: string
  state: string
  zipCode: string
}

export type CheckoutItemInput = {
  variant_id?: string
  variantId?: string
  quantity: number
}

export type PlacedOrder = {
  id: string
  orderNumber: string
  createdAt: string
  currencyCode: 'INR'
  subtotal: number
  discount: number
  shipping: number
  codFee: number
  onlineDiscount: number
  total: number
  paymentMethod: 'cod' | 'online'
  paymentStatus: CheckoutPaymentStatus
  status: string
}

export type CheckoutResult =
  | {
      success: true
      orderId: string
      order_number: string
      currencyCode: 'INR'
      subtotal: number
      discount: number
      shipping: number
      codFee: number
      onlineDiscount: number
      total: number
      paymentMethod: 'cod' | 'online'
      paymentStatus: CheckoutPaymentStatus
      orderStatus: string
      isRazorpay?: boolean
      razorpayOrderId?: string
      razorpayKeyId?: string
      razorpayAmount?: number
      error?: never
    }
  | {
      success: false
      error: string
    }

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function validateProfile(profile: CheckoutProfile) {
  if (
    !profile.fullName?.trim() ||
    !profile.phone?.trim() ||
    !profile.email?.trim() ||
    !profile.street?.trim() ||
    !profile.city?.trim() ||
    !profile.state?.trim() ||
    !profile.zipCode?.trim()
  ) {
    throw new Error('Please complete all required shipping details.')
  }

  if (!isValidIndianPhone(profile.phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.')
  }

  if (!isValidEmail(profile.email)) {
    throw new Error('Please enter a valid email address.')
  }

  if (!/^\d{6}$/.test(profile.zipCode.trim())) {
    throw new Error('Please enter a valid 6-digit Indian postal code.')
  }
}

function normalizeItems(items: CheckoutItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty.')
  }

  return items.map((item) => {
    const variantId = item.variant_id || item.variantId
    if (
      !variantId ||
      !UUID_PATTERN.test(variantId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new Error(
        'Your cart contains an invalid item. Please remove it and add the product again.'
      )
    }
    return { variantId, quantity: item.quantity }
  })
}

function normalizeOrder(data: unknown): PlacedOrder {
  if (!data || typeof data !== 'object') {
    throw new Error('The database returned an invalid order.')
  }

  const order = data as Record<string, unknown>
  if (
    typeof order.id !== 'string' ||
    typeof order.orderNumber !== 'string' ||
    typeof order.createdAt !== 'string' ||
    order.currencyCode !== 'INR' ||
    (order.paymentMethod !== 'cod' && order.paymentMethod !== 'online') ||
    !['pending', 'simulated', 'paid', 'failed'].includes(order.paymentStatus as string) ||
    typeof order.status !== 'string'
  ) {
    throw new Error('The database returned an incomplete order.')
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    currencyCode: order.currencyCode,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    codFee: Number(order.codFee),
    onlineDiscount: Number(order.onlineDiscount),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus as CheckoutPaymentStatus,
    status: order.status,
  }
}

/**
 * Places a genuine database order using a simulated online payment or COD.
 *
 * The browser supplies only variant IDs and quantities. The service-role-only
 * PostgreSQL function reloads prices/settings/coupons, locks stock, writes the
 * order snapshots, decrements inventory, records coupon usage, and clears the
 * guest order in one transaction.
 */
export async function processCheckout(
  profile: CheckoutProfile,
  items: CheckoutItemInput[],
  paymentMethod: CheckoutPaymentMethod,
  couponCode = '',
  idempotencyKey: string = randomUUID()
): Promise<CheckoutResult> {
  try {
    validateProfile(profile)
    const normalizedItems = normalizeItems(items)
    if (paymentMethod !== 'COD' && paymentMethod !== 'ONLINE') {
      throw new Error('Unsupported payment method.')
    }
    if (paymentMethod === 'ONLINE' && !(await isRazorpayEnabled())) {
      throw new Error('Online payment is currently unavailable. Please choose Cash on Delivery.')
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error('Database checkout is not configured.')
    }

    // The order's identity must come from a real, server-verified session —
    // never trust a client-submitted email/phone alone. This is what makes
    // "verify once, no need to re-verify" both possible and safe.
    const session = await getCustomerSession()
    if (!session) {
      throw new Error('Please log in (verify your email) before placing the order.')
    }
    if (session.email.trim().toLowerCase() !== profile.email.trim().toLowerCase()) {
      throw new Error('Your session does not match this email. Please refresh and try again.')
    }
    // Note: phone is intentionally NOT cross-checked against the account's
    // registered phone — shipping to a different contact number (e.g.
    // ordering for someone else) is allowed, same as the reference checkout.

    const adminClient = createAdminClient()
    const shippingAddress = {
      full_name: profile.fullName.trim(),
      phone: normalizeIndianPhone(profile.phone),
      alternate_phone: profile.alternatePhone?.trim() || null,
      email: profile.email.trim().toLowerCase(),
      address_line_1: profile.street.trim(),
      address_line_2: null,
      city: profile.city.trim(),
      state: profile.state.trim(),
      postal_code: profile.zipCode.trim(),
      country: 'India',
    }

    const { data, error } = await adminClient.rpc('place_guest_order', {
      customer_name_input: profile.fullName.trim(),
      customer_phone_input: normalizeIndianPhone(profile.phone),
      shipping_address_input: shippingAddress,
      items_input: normalizedItems,
      payment_method_input: paymentMethod === 'ONLINE' ? 'online' : 'cod',
      idempotency_key_input: idempotencyKey,
      coupon_input: couponCode.trim() || null,
    })

    if (error) {
      throw new Error(error.message)
    }

    const order = normalizeOrder(data)
    revalidatePath('/cart')
    revalidatePath('/checkout')
    revalidatePath('/profile')
    revalidatePath('/admin/orders')

    const baseResult = {
      orderId: order.id,
      order_number: order.orderNumber,
      currencyCode: order.currencyCode,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      codFee: order.codFee,
      onlineDiscount: order.onlineDiscount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    } as const

    // Order already paid (e.g. an idempotent retry after the payment was
    // already verified) — nothing more to do on the gateway side.
    if (order.paymentMethod === 'online' && order.paymentStatus !== 'paid') {
      const razorpay = getRazorpayInstance()
      if (!razorpay) {
        return { success: false, error: 'Online payments are not configured yet. Please choose Cash on Delivery.' }
      }
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(order.total * 100),
          currency: 'INR',
          receipt: order.id,
          notes: { internal_order_id: order.id },
        })
        await adminClient.from('orders').update({ razorpay_order_id: rzpOrder.id }).eq('id', order.id)

        return {
          success: true,
          ...baseResult,
          isRazorpay: true,
          razorpayOrderId: rzpOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          razorpayAmount: rzpOrder.amount,
        }
      } catch (e) {
        const reason = (e as any)?.error?.description || (e as Error)?.message || 'Unknown error'
        console.error('Razorpay order creation failed:', (e as any)?.error || e)
        return { success: false, error: `Failed to start online payment: ${reason}` }
      }
    }

    return { success: true, ...baseResult }
  } catch (error) {
    console.error('Checkout failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to place your order.',
    }
  }
}

/**
 * Verifies a completed Razorpay checkout using the HMAC signature Razorpay
 * returns to the browser, then marks the order paid. This is the
 * authoritative confirmation path alongside the webhook in
 * app/api/webhooks/razorpay/route.ts — either one marking the order paid is
 * sufficient, and both are idempotent against the order's current status.
 */
export async function verifyRazorpayPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string,
  internalOrderId: string
): Promise<{ success: true; alreadyPaid?: boolean; error?: never } | { success: false; error: string }> {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) return { success: false, error: 'Razorpay is not configured.' }

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !internalOrderId) {
      return { success: false, error: 'Missing payment verification details.' }
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return { success: false, error: 'Payment verification failed.' }
    }

    const adminClient = createAdminClient()
    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('id, razorpay_order_id, payment_status')
      .eq('id', internalOrderId)
      .maybeSingle()

    if (fetchError || !order || order.razorpay_order_id !== razorpayOrderId) {
      return { success: false, error: 'Order mismatch — payment could not be linked to your order.' }
    }

    if (order.payment_status === 'paid') {
      return { success: true, alreadyPaid: true }
    }

    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'processing',
        razorpay_payment_id: razorpayPaymentId,
        paid_at: new Date().toISOString(),
      })
      .eq('id', internalOrderId)

    if (updateError) throw new Error(updateError.message)

    revalidatePath('/checkout')
    revalidatePath('/profile')
    revalidatePath('/admin/orders')

    return { success: true }
  } catch (error) {
    console.error('Razorpay payment verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed.',
    }
  }
}

/**
 * Fetches the full order history for the logged-in customer, straight from
 * the database — keyed by the account's verified email (stored on every
 * order's shipping_address at checkout time), not by device-local storage.
 * This is what makes order history survive a cleared browser or a different
 * device, unlike the old "orders on this device" localStorage-only view.
 */
export async function getMyOrders(): Promise<
  | { success: true; orders: LocalOrder[] }
  | { success: false; orders: []; error: string }
> {
  try {
    const session = await getCustomerSession()
    if (!session) {
      return { success: false, orders: [], error: 'Not logged in.' }
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: true, orders: [] }
    }

    const email = session.email.trim().toLowerCase()
    const { data, error } = await createAdminClient()
      .from('orders')
      .select(
        `id, order_number, created_at, currency_code, subtotal, discount, shipping_cost,
         cod_cost, online_discount_amount, total_amount, payment_method, payment_status,
         order_status, shipping_address, customer_phone,
         order_items ( product_id, variant_id, product_name, variant_name, price_at_purchase, quantity )`
      )
      .eq('shipping_address->>email', email)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw new Error(error.message)

    const orders: LocalOrder[] = (data || []).map((row: any) => {
      const shipping = row.shipping_address || {}
      const shippingAddress: LocalAddress = {
        fullName: shipping.full_name || '',
        phone: shipping.phone || row.customer_phone || '',
        alternatePhone: shipping.alternate_phone || '',
        email: shipping.email || email,
        street: shipping.address_line_1 || '',
        city: shipping.city || '',
        state: shipping.state || '',
        zipCode: shipping.postal_code || '',
      }
      return {
        id: row.id,
        orderNumber: row.order_number,
        customerPhone: row.customer_phone || shippingAddress.phone,
        createdAt: row.created_at,
        currencyCode: 'INR',
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        shipping: Number(row.shipping_cost),
        codFee: Number(row.cod_cost),
        onlineDiscount: Number(row.online_discount_amount),
        total: Number(row.total_amount),
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        status: row.order_status,
        shippingAddress,
        items: (row.order_items || []).map((item: any) => ({
          productId: item.product_id,
          variantId: item.variant_id,
          productName: item.product_name,
          variantName: item.variant_name,
          price: Number(item.price_at_purchase),
          quantity: item.quantity,
        })),
      }
    })

    return { success: true, orders }
  } catch (error) {
    console.error('Fetching order history failed:', error)
    return { success: false, orders: [], error: 'Unable to load order history.' }
  }
}

export async function getGuestOrderStatuses(
  phoneInput: string,
  orderNumbersInput: string[]
): Promise<
  | { success: true; orders: Array<{ orderNumber: string; status: string; paymentStatus: string }> }
  | { success: false; orders: []; error: string }
> {
  try {
    const phone = normalizeIndianPhone(phoneInput)
    const orderNumbers = Array.from(new Set(orderNumbersInput))
      .filter((value) => /^PAN-[A-Z0-9]{6,20}$/.test(value))
      .slice(0, 100)
    if (!isValidIndianPhone(phone) || orderNumbers.length === 0) {
      return { success: false, orders: [], error: 'Invalid order lookup.' }
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: true, orders: [] }
    }

    const { data, error } = await createAdminClient()
      .from('orders')
      .select('order_number, order_status, payment_status')
      .eq('customer_phone', phone)
      .in('order_number', orderNumbers)

    if (error) throw new Error(error.message)
    return {
      success: true,
      orders: (data || []).map((order) => ({
        orderNumber: order.order_number,
        status: order.order_status,
        paymentStatus: order.payment_status,
      })),
    }
  } catch (error) {
    console.error('Order status synchronization failed:', error)
    return { success: false, orders: [], error: 'Unable to refresh order statuses.' }
  }
}
