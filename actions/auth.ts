'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { clearAdminSession, setAdminSession } from '@/lib/admin-session'
import {
  clearCustomerSession,
  devMocksEnabled,
  getCustomerSession,
  setCustomerSession,
} from '@/lib/customer-session'
import { sendOtpEmail } from '@/lib/brevo'

export type AuthResult = {
  error?: string
  success?: boolean
  customer?: SessionCustomer
}

export async function login(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  const redirectTo = formData.get('redirect_to') as string
  revalidatePath('/', 'layout')
  redirect(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/')
}

export async function register(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient()

  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string // optional

  if (!fullName || !email || !password) {
    return { error: 'Full name, email, and password are required' }
  }

  // 1. Create the user using the Admin API to forcefully confirm the email 
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminAuth = createAdminClient().auth.admin

  const { data: newUser, error: createError } = await adminAuth.createUser({
    email,
    password,
    email_confirm: true, // Forces immediate verification!
    user_metadata: {
      full_name: fullName,
      phone: phone || '',
      role: 'customer',
    },
  })

  if (createError) {
    if (createError.message.includes('already been registered')) {
      return { error: 'An account with this email already exists' }
    }
    return { error: createError.message }
  }

  // Fallback profile insert in case trigger doesn't exist
  try {
    if (newUser?.user) {
      await supabase.from('profiles').insert({
        id: newUser.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role: 'customer',
      })
    }
  } catch (e) {
    // Suppress if trigger handled it
  }

  // 2. Sign in with standard client to establish browser sessions
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: 'Account created but failed to log in automatically.' }
  }

  const redirectTo = formData.get('redirect_to') as string
  revalidatePath('/', 'layout')
  redirect(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/')
}

/**
 * Lightweight existence check used by the sign-up form so it can steer
 * an already-registered visitor to the login page *before* an OTP is
 * ever sent, instead of letting them fill in the whole form first.
 */
export async function checkCustomerEmailExists(email: string): Promise<boolean> {
  if (!email) return false
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  return !!profile
}

export async function sendEmailOtp(
  email: string,
  mode: 'LOGIN' | 'REGISTER',
  fullName?: string
): Promise<AuthResult> {
  const supabase = await createClient()

  if (!email) {
    return { error: 'Email is required' }
  }

  if (mode === 'LOGIN') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!profile) {
      return { error: 'No account found for this email. Please sign up first.' }
    }
  }

  if (mode === 'REGISTER') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (profile) {
      return { error: 'An account with this email already exists. Please log in instead.' }
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Clean old OTPs for this email & clean all expired OTPs globally
  await supabase.from('email_otps').delete().eq('email', email).eq('purpose', 'login')
  await supabase.from('email_otps').delete().lt('expires_at', new Date().toISOString())

  // Insert OTP record
  const { error: dbError } = await supabase
    .from('email_otps')
    .insert({
      email,
      otp,
      full_name: fullName || null,
      purpose: 'login',
      expires_at: expiresAt
    })

  if (dbError) {
    console.error('OTP Save DB Error:', dbError)
    return { error: 'Failed to generate verification code. Please try again.' }
  }

  const result = await sendOtpEmail(email, otp, {
    description: 'Please enter the 6-digit OTP code below to secure your login session.',
  })

  if ('error' in result) {
    return { error: result.error }
  }

  return { success: true }
}

export async function verifyEmailOtp(
  email: string,
  otp: string,
  redirectTo?: string,
  fullName?: string,
  phone?: string
): Promise<AuthResult> {
  const supabase = await createClient()

  if (!email || !otp) {
    return { error: 'Email and OTP code are required' }
  }

  const { data: records } = await supabase
    .from('email_otps')
    .select('*')
    .eq('email', email)
    .eq('purpose', 'login')
    .order('created_at', { ascending: false })

  const record = records?.[0]
  if (!record) {
    return { error: 'No OTP requested for this email' }
  }

  if (record.otp !== otp) {
    return { error: 'Invalid OTP code' }
  }

  if (new Date(record.expires_at) < new Date()) {
    await supabase.from('email_otps').delete().eq('email', email).eq('purpose', 'login')
    return { error: 'OTP has expired. Please request a new one.' }
  }

  // OTP verified, delete it
  await supabase.from('email_otps').delete().eq('email', email).eq('purpose', 'login')

  const isMock =
    devMocksEnabled() &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'))
  if (isMock) {
    const mockUserId = crypto.randomUUID()
    await supabase.from('profiles').insert({
      id: mockUserId,
      email,
      full_name: fullName || record.full_name || 'Customer',
      role: 'customer',
      phone: phone || null
    })
    await setCustomerSession({
      id: mockUserId,
      email,
      full_name: fullName || record.full_name || 'Customer',
      phone: phone || null,
    })

    revalidatePath('/', 'layout')
    redirect(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/')
  }

  // Real Supabase Auth Flow
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminAuth = createAdminClient().auth.admin

  // Check profiles table first
  let userExists = false
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingProfile) {
    userExists = true
  }

  if (!userExists) {
    try {
      const { data: userList } = await adminAuth.listUsers()
      const userData = (userList?.users as any[])?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (userData) {
        userExists = true
      }
    } catch (e) {
      // user does not exist
    }
  }

  if (!userExists) {
    const nameToUse = fullName || record.full_name || 'Customer'
    const { data: newUser, error: createError } = await adminAuth.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: nameToUse,
        role: 'customer'
      }
    })

    if (createError) {
      if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
        // User actually exists, safe to proceed
      } else {
        console.error('createUser failed:', createError)
        return { error: 'Failed to create user account: ' + createError.message }
      }
    } else if (newUser?.user) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: newUser.user.id,
        email,
        full_name: nameToUse,
        role: 'customer',
        phone: phone || null
      })
      if (insertError) {
        // Not fatal by itself (a DB trigger may already have created the row,
        // or profiles.phone may not exist yet) — logged so it's diagnosable,
        // the fallback re-select/insert below will retry.
        console.error('Profile insert after createUser failed:', insertError)
      }
    }
  }

  // Custom Cookie Auth Session
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (profileFetchError) {
    console.error('Profile fetch by email failed:', profileFetchError)
  }

  let finalProfile = profile
  if (!finalProfile) {
    try {
      const { data: userList } = await adminAuth.listUsers()
      const userData = (userList?.users as any[])?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (userData) {
        const nameToUse = fullName || record.full_name || 'Customer'
        const { data: insertedProfile, error: fallbackInsertError } = await supabase
          .from('profiles')
          .insert({
            id: userData.id,
            email,
            full_name: nameToUse,
            role: 'customer',
            phone: phone || null
          })
          .select('*')
          .single()
        if (fallbackInsertError) {
          console.error('Fallback profile insert failed:', fallbackInsertError)
        }
        finalProfile = insertedProfile
      } else {
        console.error(`No auth.users record found for ${email} after createUser — check SUPABASE_SERVICE_ROLE_KEY is valid.`)
      }
    } catch (e) {
      console.error('Error fetching user fallback:', e)
    }
  }

  if (!finalProfile) {
    return {
      error:
        'Failed to establish user profile session. This usually means the `profiles` table (or its `phone` column) or the `email_otps` table has not been migrated on your Supabase project yet — check the server logs above for the exact database error.',
    }
  }

  // Backfill a phone number for accounts created before it was collected.
  if (!finalProfile.phone && phone) {
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', finalProfile.id)
      .select('*')
      .single()
    if (updatedProfile) finalProfile = updatedProfile
  }

  await setCustomerSession({
    id: finalProfile.id,
    email: finalProfile.email,
    full_name: finalProfile.full_name,
    phone: finalProfile.phone || phone || null,
  })

  revalidatePath('/', 'layout')
  if (redirectTo === 'NO_REDIRECT') {
    return {
      success: true,
      customer: {
        id: finalProfile.id,
        email: finalProfile.email,
        fullName: finalProfile.full_name,
        phone: finalProfile.phone || phone || '',
      },
    }
  }
  redirect(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/')
}

export async function adminLogin(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string | null)?.trim()
  const password = formData.get('password') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured')
    return { error: 'Admin login is not configured' }
  }

  if (
    email.toLowerCase() !== adminEmail.trim().toLowerCase() ||
    password !== adminPassword
  ) {
    return { error: 'Invalid login credentials' }
  }

  await setAdminSession(adminEmail.trim().toLowerCase())

  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

export type SessionCustomer = {
  id: string
  email: string
  fullName: string
  phone: string
}

/**
 * Lightweight, client-safe read of the current real customer session
 * (httpOnly JWT cookie). Used by CustomerContext to hydrate client state
 * without exposing any Supabase/admin internals.
 */
export async function getSessionCustomer(): Promise<SessionCustomer | null> {
  const session = await getCustomerSession()
  if (!session) return null
  return {
    id: session.sub,
    email: session.email,
    fullName: session.full_name,
    phone: session.phone || '',
  }
}

/**
 * Clears the customer session cookie without redirecting, so client code
 * (e.g. a header/profile logout button) can control navigation itself.
 */
export async function logoutCustomer() {
  await clearCustomerSession()
  revalidatePath('/', 'layout')
}

export async function getCurrentCustomer() {
  const session = await getCustomerSession()
  if (session) {
    return {
      id: session.sub,
      email: session.email,
      user_metadata: {
        role: session.role,
        full_name: session.full_name,
      },
    }
  }
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function adminLogout() {
  await clearAdminSession()
  redirect('/admin/login')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  await clearCustomerSession()
  revalidatePath('/', 'layout')
  redirect('/login')
}

