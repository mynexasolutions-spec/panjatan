export const CUSTOMER_STORAGE_KEY = 'gulshan-customer'
export const ADDRESS_STORAGE_KEY = 'gulshan-addresses'
export const ORDER_STORAGE_KEY = 'gulshan-orders'
export const LEGACY_PROFILE_STORAGE_KEY = 'gulshan-customer-profile'
export const CUSTOMER_CHANGED_EVENT = 'gulshan-login-status-change'

export type LocalCustomer = {
  id: string
  fullName: string
  phone: string
  email: string
}

export type LocalAddress = {
  fullName: string
  phone: string
  alternatePhone: string
  email?: string
  street: string
  city: string
  state: string
  zipCode: string
}

export type LocalOrderItem = {
  productId: string
  variantId?: string
  productName: string
  variantName?: string
  imageUrl?: string
  price: number
  quantity: number
}

export type LocalOrder = {
  id: string
  orderNumber: string
  customerPhone: string
  createdAt: string
  currencyCode: 'INR'
  subtotal: number
  discount: number
  shipping: number
  codFee: number
  onlineDiscount: number
  total: number
  paymentMethod: 'cod' | 'online'
  paymentStatus: string
  status: string
  shippingAddress: LocalAddress
  items: LocalOrderItem[]
}

export function normalizeIndianPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return digits
}

export function isValidIndianPhone(value: string) {
  return /^[6-9]\d{9}$/.test(normalizeIndianPhone(value))
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim())
}

export function isValidCustomerName(value: string) {
  const name = value.trim().replace(/\s+/g, ' ')
  return name.length >= 2 && name.length <= 80
}

export function sanitizeReturnTo(value?: string | null, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  try {
    const parsed = new URL(value, 'https://panjatan.local')
    return parsed.origin === 'https://panjatan.local'
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback
  } catch {
    return fallback
  }
}

