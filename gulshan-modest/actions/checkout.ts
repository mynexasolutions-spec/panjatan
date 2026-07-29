'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { isValidIndianPhone, normalizeIndianPhone } from '@/lib/local-customer'

export type CheckoutPaymentMethod = 'COD' | 'ONLINE'
export type CheckoutPaymentStatus = 'pending' | 'simulated'

export type CheckoutProfile = {
  fullName: string
  phone: string
  alternatePhone?: string
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
  status: 'pending'
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
      orderStatus: 'pending'
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
    (order.paymentStatus !== 'pending' && order.paymentStatus !== 'simulated') ||
    order.status !== 'pending'
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
    paymentStatus: order.paymentStatus,
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

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error('Database checkout is not configured.')
    }

    const adminClient = createAdminClient()
    const shippingAddress = {
      full_name: profile.fullName.trim(),
      phone: normalizeIndianPhone(profile.phone),
      alternate_phone: profile.alternatePhone?.trim() || null,
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

    return {
      success: true,
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
    }
  } catch (error) {
    console.error('Checkout failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to place your order.',
    }
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
