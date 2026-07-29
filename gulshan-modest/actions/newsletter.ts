'use server'

import { createClient } from '@supabase/supabase-js'

export async function subscribeToNewsletter(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, error: 'Enter a valid email address.' }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return { success: false, error: 'Newsletter service is not configured.' }

  const client = createClient(url, anonKey, { auth: { persistSession: false } })
  const { error } = await client.from('newsletter_subscribers').insert({ email: normalizedEmail, source: 'footer' })
  if (error && error.code !== '23505') return { success: false, error: error.message }
  return { success: true }
}
