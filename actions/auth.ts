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

export type AuthResult = {
  error?: string
  success?: boolean
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
      return { error: 'User does not exist, first create an account' }
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Clean old OTPs for this email & clean all expired OTPs globally
  await supabase.from('email_otps').delete().eq('email', email)
  await supabase.from('email_otps').delete().lt('expires_at', new Date().toISOString())

  // Insert OTP record
  const { error: dbError } = await supabase
    .from('email_otps')
    .insert({
      email,
      otp,
      full_name: fullName || null,
      expires_at: expiresAt
    })

  if (dbError) {
    console.error('OTP Save DB Error:', dbError)
    return { error: 'Failed to generate verification code. Please try again.' }
  }

  const brevoApiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@panjatanayurveda.com'
  const senderName = process.env.BREVO_SENDER_NAME || 'Panjatan Ayurveda'

  if (!brevoApiKey) {
    console.log(`[DEV MODE OTP] Email: ${email}, OTP: ${otp}`)
    return { success: true }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject: 'Your Verification Code - Panjatan Ayurveda',
        htmlContent: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #E6DAC4; border-radius: 24px; background-color: #FBF7F0; text-align: center; box-shadow: 0 4px 20px rgba(33,29,25,0.025);">
            <!-- Logo Header -->
            <div style="margin-bottom: 24px;">
              <h1 style="color: #1E3B2E; font-size: 26px; font-weight: bold; letter-spacing: 2px; margin: 0; font-family: Georgia, serif;">PANJATAN AYURVEDA</h1>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #E6DAC4; margin: 24px 0;" />
            
            <!-- Message Heading -->
            <h2 style="color: #211D19; font-size: 20px; font-weight: bold; margin-bottom: 8px;">Verification Code</h2>
            <p style="color: #211D19; opacity: 0.8; font-size: 14px; line-height: 1.6; margin-top: 0; max-width: 380px; margin-left: auto; margin-right: auto;">
              Please enter the 6-digit OTP code below to secure your login session.
            </p>
            
            <!-- OTP Block -->
            <div style="margin: 32px 0;">
              <div style="display: inline-block; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #1E3B2E; padding: 16px 32px; border: 1.5px solid #B9893F; border-radius: 16px; background-color: #F3EADC; text-shadow: 0 1px 0 #fff; box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);">
                ${otp}
              </div>
            </div>
            
            <!-- Expiry notice -->
            <p style="color: #211D19; opacity: 0.6; font-size: 12px; line-height: 1.5; margin: 24px 0;">
              This verification code is valid for <strong style="color: #211D19;">10 minutes</strong>.<br />
              If you did not request this verification, please ignore this email.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #E6DAC4; margin: 24px 0;" />
            
            <!-- Footer -->
            <p style="color: #B9893F; opacity: 0.7; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} Panjatan Ayurveda. All rights reserved.
            </p>
          </div>
        `
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Brevo API Error:', errText)
      return { error: 'Failed to send verification email.' }
    }

    return { success: true }
  } catch (e: any) {
    console.error('Email Send Error:', e)
    return { error: 'Failed to send verification email: ' + e.message }
  }
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
    .order('created_at', { ascending: false })

  const record = records?.[0]
  if (!record) {
    return { error: 'No OTP requested for this email' }
  }

  if (record.otp !== otp) {
    return { error: 'Invalid OTP code' }
  }

  if (new Date(record.expires_at) < new Date()) {
    await supabase.from('email_otps').delete().eq('email', email)
    return { error: 'OTP has expired. Please request a new one.' }
  }

  // OTP verified, delete it
  await supabase.from('email_otps').delete().eq('email', email)

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
        return { error: 'Failed to create user account: ' + createError.message }
      }
    } else {
      try {
        if (newUser?.user) {
          await supabase.from('profiles').insert({
            id: newUser.user.id,
            email,
            full_name: nameToUse,
            role: 'customer',
            phone: phone || null
          })
        }
      } catch (e) {
        // Silently catch in case database trigger handles it
      }
    }
  }

  // Custom Cookie Auth Session
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  let finalProfile = profile
  if (!finalProfile) {
    try {
      const { data: userList } = await adminAuth.listUsers()
      const userData = (userList?.users as any[])?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (userData) {
        const nameToUse = fullName || record.full_name || 'Customer'
        const { data: insertedProfile } = await supabase.from('profiles').insert({
          id: userData.id,
          email,
          full_name: nameToUse,
          role: 'customer',
          phone: phone || null
        }).select('*').single()
        finalProfile = insertedProfile
      }
    } catch (e) {
      console.error('Error fetching user fallback:', e)
    }
  }

  if (!finalProfile) {
    return { error: 'Failed to establish user profile session.' }
  }

  await setCustomerSession({
    id: finalProfile.id,
    email: finalProfile.email,
    full_name: finalProfile.full_name,
  })

  revalidatePath('/', 'layout')
  if (redirectTo === 'NO_REDIRECT') {
    return { success: true }
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

