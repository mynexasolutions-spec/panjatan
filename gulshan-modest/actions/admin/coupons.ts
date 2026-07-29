'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'flat'
  value: number
  min_purchase: number
  is_active: boolean
  created_at?: string
}

export async function getCoupons() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
  return (data || []) as Coupon[]
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('coupons')
    .insert([{
      ...coupon,
      id: crypto.randomUUID(),
      code: coupon.code.toUpperCase().trim()
    }])
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/settings/coupons')
  return { success: true }
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/settings/coupons')
  return { success: true }
}

export async function validateCoupon(code: string, subtotal: number) {
  const supabase = await createClient()
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single()

  if (!coupon) {
    return { success: false, error: 'Invalid or inactive coupon code' }
  }

  if (subtotal < coupon.min_purchase) {
    return {
      success: false,
      error: `Minimum purchase of ₹${coupon.min_purchase} required to use this coupon.`
    }
  }

  return { success: true, coupon }
}
