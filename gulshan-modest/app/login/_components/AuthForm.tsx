'use client'

import { FormEvent, useState } from 'react'
import { ArrowLeft, ArrowRight, KeyRound, Phone, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCustomer } from '@/context/CustomerContext'
import {
  DEMO_OTP,
  isValidCustomerName,
  isValidIndianPhone,
  normalizeIndianPhone,
} from '@/lib/local-customer'

export default function AuthForm({ returnTo = '/' }: { returnTo?: string }) {
  const router = useRouter()
  const { customer, login } = useCustomer()
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS')
  const [fullName, setFullName] = useState(customer?.fullName || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const continueToOtp = (event: FormEvent) => {
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
    setPhone(normalizeIndianPhone(phone))
    setStep('OTP')
  }

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (otp !== DEMO_OTP) {
      setError('Incorrect OTP. Use the demo OTP 123456.')
      return
    }
    try {
      await login(fullName, phone)
      router.replace(returnTo)
      router.refresh()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to log in.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Demo login only — no SMS is sent. Use OTP <strong className="tracking-widest">123456</strong>.
      </div>
      {error && (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {step === 'DETAILS' ? (
        <form onSubmit={continueToOtp} className="space-y-4" noValidate>
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
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-cream transition hover:bg-gold hover:text-ink">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4" noValidate>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <KeyRound className="h-5 w-5" />
            </div>
            <p className="text-sm text-ink/60">Enter the 6-digit demo OTP for</p>
            <p className="font-semibold text-ink">+91 {phone}</p>
          </div>
          <input aria-label="6-digit OTP" inputMode="numeric" autoComplete="one-time-code"
            value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="w-full rounded-xl border border-cream-line bg-cream px-4 py-3 text-center text-2xl font-bold tracking-[0.45em] outline-none focus:border-gold"
            placeholder="123456" autoFocus />
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-cream transition hover:bg-gold hover:text-ink">
            Verify & continue <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => { setStep('DETAILS'); setOtp(''); setError('') }}
            className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-ink/60 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Change details
          </button>
        </form>
      )}
    </div>
  )
}
