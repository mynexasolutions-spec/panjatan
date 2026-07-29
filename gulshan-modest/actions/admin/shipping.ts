'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ShippingActionResult = {
  error?: string
  success?: boolean
}

export async function getShippingSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('shipping')
    .single()

  if (error || !data?.shipping) {
    console.warn('Shipping settings not found in database, using safe defaults.');
    return {
      flat_rate: 99,
      free_threshold: 1999,
      cod_charge: 50,
      online_discount: 0
    }
  }

  const shipping = data.shipping
  if (shipping.online_discount === undefined) {
    shipping.online_discount = 0
  }

  return shipping
}

export async function updateShippingSettings(
  flatRate: number,
  freeThreshold: number,
  codCharge: number,
  onlineDiscount: number
): Promise<ShippingActionResult> {
  const supabase = await createClient()

  // Update shipping config inside settings table
  const { error } = await supabase
    .from('settings')
    .update({
      shipping: {
        flat_rate: flatRate,
        free_threshold: freeThreshold,
        cod_charge: codCharge,
        online_discount: onlineDiscount
      }
    })
    .eq('id', 'global-settings-id') // Or matching single settings document

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/settings/shipping')
  return { success: true }
}
