'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail, Phone, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCustomer } from '@/context/CustomerContext'
import { sendEmailOtp, verifyEmailOtp } from '@/actions/auth'
import {
  isValidCustomerName,
  isValidEmail,
  isValidIndianPhone,
  normalizeIndianPhone,
} from '@/lib/local-customer'

const RESEND_COOLDOWN_SECONDS = 45

export default function AuthForm({ returnTo = '/' }: { returnTo?: string }) {
  const router = useRouter()
  const { customer, refreshCustomer } = useCustomer()
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS')
  const [fullName, setFullName] = useState(customer?.fullName || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown((current) => (current > 0 ? current - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const sendCode = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!isValidCustomerName(fullName)) {
      setError('Please enter your full name (at least 2 characters).')
      return
    }
    if (!isValidIndianPhone(phone)) {
      setError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setSending(true)
    const res = await sendEmailOtp(email.trim().toLowerCase(), 'REGISTER', fullName.trim())
    setSending(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setPhone(normalizeIndianPhone(phone))
    setOtp('')
    setStep('OTP')
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
  }

  const resendCode = async () => {
    if (resendCooldown > 0 || sending) return
    setError('')
    setSending(true)
    const res = await sendEmailOtp(email.trim().toLowerCase(), 'REGISTER', fullName.trim())
    setSending(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
  }

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code from your email.')
      return
    }
    setVerifying(true)
    const res = await verifyEmailOtp(email.trim().toLowerCase(), otp, 'NO_REDIRECT', fullName.trim(), phone)
    setVerifying(false)
    if (res.error) {
      setError(res.error)
      return
    }
    if (res.customer) {
      await refreshCustomer({
        id: res.customer.id,
        email: res.customer.email,
        fullName: res.customer.fullName,
        phone: res.customer.phone,
      })
    } else {
      await refreshCustomer()
    }
    router.replace(returnTo)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {error && (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {step === 'DETAILS' ? (
        <form onSubmit={sendCode} className="space-y-4" noValidate>
          <div>
            <label htmlFor="customer-name" className="mb-1.5 block text-sm font-medium text-ink/70">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
              <input id="customer-name" autoComplete="name" value={fullName}
                onChange={(event) => setFullName(event.target.value)} maxLength={80}
                className="w-full rounded-xl border border-cream-line bg-cream py-3 pl-11 pr-4 outline-none transition focus:border-gold"
                placeholder="Your full name" autoFocus />
            </div>
          </div>
          <div>
            <label htmlFor="customer-phone" className="mb-1.5 block text-sm font-medium text-ink/70">Mobile number</label>
            <div className="flex rounded-xl border border-cream-line bg-cream focus-within:border-gold">
              <span className="flex items-center border-r border-cream-line px-3 text-sm font-semibold text-ink/60">+91</span>
              <div className="relative flex-1">
                <Phone className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
                <input id="customer-phone" type="tel" inputMode="numeric" autoComplete="tel-national"
                  value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full rounded-r-xl bg-transparent py-3 pl-11 pr-4 outline-none" placeholder="9876543210" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="customer-email" className="mb-1.5 block text-sm font-medium text-ink/70">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
              <input id="customer-email" type="email" autoComplete="email" value={email}
                onChange={(event) => setEmail(event.target.value)} maxLength={120}
                className="w-full rounded-xl border border-cream-line bg-cream py-3 pl-11 pr-4 outline-none transition focus:border-gold"
                placeholder="you@example.com" />
            </div>
            <p className="mt-1.5 text-xs text-ink/45">We'll email you a 6-digit code to verify it's you.</p>
          </div>
          <button disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-cream transition hover:bg-gold hover:text-ink disabled:opacity-60">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4" noValidate>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <KeyRound className="h-5 w-5" />
            </div>
            <p className="text-sm text-ink/60">Enter the 6-digit code sent to</p>
            <p className="font-semibold text-ink">{email}</p>
          </div>
          <input aria-label="6-digit OTP" inputMode="numeric" autoComplete="one-time-code"
            value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="w-full rounded-xl border border-cream-line bg-cream px-4 py-3 text-center text-2xl font-bold tracking-[0.45em] outline-none focus:border-gold"
            placeholder="123456" autoFocus />
          <button type="submit" disabled={verifying}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-cream transition hover:bg-gold hover:text-ink disabled:opacity-60">
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & continue <ArrowRight className="h-4 w-4" /></>}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep('DETAILS'); setOtp(''); setError('') }}
              className="inline-flex items-center gap-2 py-2 font-medium text-ink/60 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Change details
            </button>
            <button type="button" onClick={resendCode} disabled={resendCooldown > 0 || sending}
              className="py-2 font-medium text-ink/60 hover:text-ink disabled:opacity-50">
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
