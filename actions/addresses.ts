'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAddress(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const fullName = formData.get('full_name')?.toString()
  const phone = formData.get('phone')?.toString()
  const addressLine1 = formData.get('address_line_1')?.toString()
  const addressLine2 = formData.get('address_line_2')?.toString() || null
  const city = formData.get('city')?.toString()
  const state = formData.get('state')?.toString()
  const postalCode = formData.get('postal_code')?.toString()
  const isDefault = formData.get('is_default') === 'on'

  if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
    return { success: false, error: 'All required fields must be filled.' }
  }

  // If this address is set as default, we need to unset any other default first
  if (isDefault) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
  } else {
    // If it's the first address, make it default automatically
    const { count } = await supabase.from('addresses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count === 0) {
      // It's the first one, make it default regardless of checkbox
    }
  }

  // Double check the count trick
  const finalIsDefault = isDefault ? true : false

  const { error } = await supabase
    .from('addresses')
    .insert([{
      user_id: user.id,
      full_name: fullName,
      phone,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      country: 'India',
      is_default: finalIsDefault
    }])

  // If this was the very first address but they didn't check the box, 
  // we could forcefully set it. For simplicity, let's just insert what they asked,
  // but if it's the first one, we'll force it.
  if (!finalIsDefault) {
    const { count } = await supabase.from('addresses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count === 1) { // It's 1 because we just inserted it
      await supabase.from('addresses').update({ is_default: true }).eq('user_id', user.id)
    }
  }

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/account/addresses')
  return { success: true }
}

export async function updateAddress(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const fullName = formData.get('full_name')?.toString()
  const phone = formData.get('phone')?.toString()
  const addressLine1 = formData.get('address_line_1')?.toString()
  const addressLine2 = formData.get('address_line_2')?.toString() || null
  const city = formData.get('city')?.toString()
  const state = formData.get('state')?.toString()
  const postalCode = formData.get('postal_code')?.toString()
  const isDefault = formData.get('is_default') === 'on'

  if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
    return { success: false, error: 'All required fields must be filled.' }
  }

  if (isDefault) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
  }

  const { error } = await supabase
    .from('addresses')
    .update({
      full_name: fullName,
      phone,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      is_default: isDefault
    })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure they own it

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/account/addresses')
  return { success: true }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/account/addresses')
  return { success: true }
}

export async function setDefaultAddress(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Unset all others
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)

  // Set the target
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/account/addresses')
  return { success: true }
}
