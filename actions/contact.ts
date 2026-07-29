'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitInquiry(formData: FormData) {
  const supabase = await createClient()

  const first_name = formData.get('first-name') as string
  const last_name = formData.get('last-name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!first_name || !last_name || !email || !message) {
    return { success: false, error: 'All fields are required.' }
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please provide a valid email address.' }
  }

  const { error } = await supabase
    .from('contact_inquiries')
    .insert([{
      first_name,
      last_name,
      email,
      message,
      status: 'unread'
    }])

  if (error) {
    console.error('Failed to submit inquiry:', error)
    return { success: false, error: 'Something went wrong. Please try again later.' }
  }

  return { success: true }
}
