// Database type definitions for Gulshan Modest
// These types mirror the Supabase database schema

export type UserRole = 'customer' | 'admin'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

// ─── Profiles ────────────────────────────────────────────────
export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Addresses ───────────────────────────────────────────────
export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// ─── Categories ──────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Products ────────────────────────────────────────────────
export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  short_description: string | null
  description: string | null
  featured_image_url: string | null
  badge: string | null
  color_group_id: string | null
  color_name: string | null
  color_hex: string | null
  average_rating: number
  review_count: number
  is_active: boolean
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

// ─── Product Variants ────────────────────────────────────────
export interface ProductVariant {
  id: string
  product_id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Product Images ──────────────────────────────────────────
export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
  color_name?: string | null
  created_at: string
}

// ─── Product Information ─────────────────────────────────────
export interface ProductInformation {
  id: string
  product_id: string
  label: string
  value: string
  display_order: number
}

// ─── Product FAQs ────────────────────────────────────────────
export interface ProductFAQ {
  id: string
  product_id: string
  question: string
  answer: string
  display_order: number
}

// ─── Reviews ─────────────────────────────────────────────────
export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  review_text: string | null
  is_approved: boolean
  created_at: string
}

// ─── Cart Items ──────────────────────────────────────────────
export interface CartItem {
  id: string
  user_id: string
  variant_id: string
  quantity: number
  created_at: string
  updated_at: string
}

// ─── Orders ──────────────────────────────────────────────────
export interface Order {
  id: string
  order_number: string
  user_id: string
  address_id: string | null
  subtotal: number
  shipping_cost: number
  total_amount: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  payment_method: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  created_at: string
  updated_at: string
}

// ─── Order Items ─────────────────────────────────────────────
export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_name: string
  price_at_purchase: number
  quantity: number
  line_total: number
}

// ─── Inquiries ───────────────────────────────────────────────
export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  is_resolved: boolean
  created_at: string
}

// ─── Hero Slides ─────────────────────────────────────────────
export interface HeroSlide {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  button_text: string | null
  button_link: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Announcements ───────────────────────────────────────────
export interface Announcement {
  id: string
  message: string
  is_active: boolean
  created_at: string
  updated_at: string
}
