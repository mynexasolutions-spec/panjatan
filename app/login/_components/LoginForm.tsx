'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCustomer } from '@/context/CustomerContext'
import { sendEmailOtp, verifyEmailOtp } from '@/actions/auth'
import { isValidEmail } from '@/lib/local-customer'

const RESEND_COOLDOWN_SECONDS = 45

export default function LoginForm({
  returnTo = '/',
  initialEmail = '',
}: {
  returnTo?: string
  initialEmail?: string
}) {
  const router = useRouter()
  const { refreshCustomer } = useCustomer()
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL')
  const [email, setEmail] = useState(initialEmail)
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
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setSending(true)
    const res = await sendEmailOtp(email.trim().toLowerCase(), 'LOGIN')
    setSending(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setOtp('')
    setStep('OTP')
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
  }

  const resendCode = async () => {
    if (resendCooldown > 0 || sending) return
    setError('')
    setSending(true)
    const res = await sendEmailOtp(email.trim().toLowerCase(), 'LOGIN')
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
    const res = await verifyEmailOtp(email.trim().toLowerCase(), otp, 'NO_REDIRECT')
    setVerifying(false)
    if (res.error) {
      setError(res.error)
      return
    }
    await refreshCustomer()
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
      {step === 'EMAIL' ? (
        <form onSubmit={sendCode} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink/70">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
              <input id="login-email" type="email" autoComplete="email" value={email}
                onChange={(event) => setEmail(event.target.value)} maxLength={120}
                className="w-full rounded-xl border border-cream-line bg-cream py-3 pl-11 pr-4 outline-none transition focus:border-gold"
                placeholder="you@example.com" autoFocus />
            </div>
            <p className="mt-1.5 text-xs text-ink/45">We'll email you a 6-digit code to verify it's you.</p>
          </div>
          <button disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-cream transition hover:bg-gold hover:text-ink disabled:opacity-60">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </button>
          <p className="text-center text-sm text-ink/60">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-ink hover:text-gold">
              Sign up
            </Link>
          </p>
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
          <button disabled={verifying || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-cream transition hover:bg-gold hover:text-ink disabled:opacity-60">
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & continue <ArrowRight className="h-4 w-4" /></>}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep('EMAIL'); setOtp(''); setError('') }}
              className="inline-flex items-center gap-2 py-2 font-medium text-ink/60 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Change email
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
