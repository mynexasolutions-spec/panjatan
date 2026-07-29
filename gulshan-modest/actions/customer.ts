'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  isValidCustomerName,
  isValidIndianPhone,
  normalizeIndianPhone,
} from '@/lib/local-customer'

export async function registerDemoCustomer(fullNameInput: string, phoneInput: string) {
  const fullName = fullNameInput.trim().replace(/\s+/g, ' ')
  const phone = normalizeIndianPhone(phoneInput)
  if (!isValidCustomerName(fullName) || !isValidIndianPhone(phone)) {
    return { success: false as const }
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false as const }
  }

  const { error } = await createAdminClient()
    .from('guest_customers')
    .upsert(
      { phone, full_name: fullName, updated_at: new Date().toISOString() },
      { onConflict: 'phone' }
    )

  if (error) {
    console.error('Unable to register demo customer:', error.message)
    return { success: false as const }
  }
  return { success: true as const }
}

