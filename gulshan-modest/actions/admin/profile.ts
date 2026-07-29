'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProfileActionResult = {
  error?: string
  success?: boolean
}

export async function getAdminProfile() {
  const supabase = await createClient()

  // Fetch admin profile
  const { data: admin } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .single()

  return admin || {
    id: 'mock-admin-id',
    email: 'admin@gulshanmodest.com',
    full_name: 'Admin',
    phone: '+91 87964 59447'
  }
}

export async function updateAdminProfile(
  formData: FormData
): Promise<ProfileActionResult> {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  if (!fullName || !email) {
    return { error: 'Full Name and Email are required.' }
  }

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      email,
      phone
    })
    .eq('role', 'admin')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/settings/profile')
  return { success: true }
}
