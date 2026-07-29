'use client'

import React, { useState, useTransition } from 'react'
import { sendEmailOtp, verifyEmailOtp } from '@/actions/auth'
import { Loader2, User, Mail, ArrowRight, KeyRound, Check, Phone } from 'lucide-react'

export default function AuthForm({ redirectTo }: { redirectTo?: string }) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  
  // OTP Flow States
  const [otpSent, setOtpSent] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpFullName, setOtpFullName] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  // Countdown timer for resending OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  // Send OTP handler
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!otpEmail) {
      setError('Please enter a valid email address.')
      return
    }

    if (mode === 'REGISTER' && !otpFullName) {
      setError('Please enter your full name.')
      return
    }

    startTransition(async () => {
      const res = await sendEmailOtp(otpEmail, mode, otpFullName)
      if (res?.error) {
        setError(res.error)
      } else {
        setOtpSent(true)
        setResendTimer(60)
        setSuccess(`A 6-digit verification code has been sent to ${otpEmail}`)
      }
    })
  }

  // Verify OTP handler
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code.')
      return
    }

    startTransition(async () => {
      const res = await verifyEmailOtp(otpEmail, otpCode, redirectTo, otpFullName, otpPhone)
      if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert Messages */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
          <span className="font-semibold mt-0.5">Oops!</span> 
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 flex items-start gap-2">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* --- 100% OTP Authentication Flow --- */}
      <div className="space-y-4">
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === 'REGISTER' && (
              <>
                <div>
                  <label htmlFor="otp_name" className="block text-sm font-medium text-ink/70 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="otp_name"
                      type="text"
                      required
                      value={otpFullName}
                      onChange={(e) => setOtpFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-line bg-cream focus:outline-none focus:border-gold transition-colors"
                      placeholder="Ayesha Khan"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  </div>
                </div>

                <div>
                  <label htmlFor="otp_phone" className="block text-sm font-medium text-ink/70 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="otp_phone"
                      type="text"
                      required
                      maxLength={10}
                      pattern="\d{10}"
                      title="Please enter exactly 10 digits"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-line bg-cream focus:outline-none focus:border-gold transition-colors"
                      placeholder="9876543210"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="otp_email" className="block text-sm font-medium text-ink/70 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="otp_email"
                  type="email"
                  required
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-line bg-cream focus:outline-none focus:border-gold transition-colors"
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 px-4 bg-ink text-cream rounded-xl font-semibold hover:bg-gold transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {pending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'LOGIN' ? 'Send Login OTP' : 'Send Registration OTP'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="otp_code" className="block text-sm font-medium text-ink/70">
                  Enter Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setError('')
                    setSuccess('')
                  }}
                  className="text-xs text-gold hover:underline font-semibold"
                >
                  Change Email
                </button>
              </div>
              <div className="relative">
                <input
                  id="otp_code"
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 tracking-widest text-center text-lg font-bold rounded-xl border border-cream-line bg-cream focus:outline-none focus:border-gold transition-colors"
                  placeholder="123456"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 px-4 bg-ink text-cream rounded-xl font-semibold hover:bg-gold transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {pending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify & {mode === 'LOGIN' ? 'Login' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <div className="text-center mt-2">
               <button
                 type="button"
                 onClick={handleSendOtp}
                 disabled={pending || resendTimer > 0}
                 className="text-xs text-ink/70 hover:text-gold transition-colors font-medium underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
               >
                 {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend verification code'}
               </button>
             </div>
          </form>
        )}
      </div>

      {/* Switch mode links */}
      <div className="pt-4 border-t border-cream-line text-center">
        <p className="text-sm text-ink/70">
          {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
        </p>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')
            setOtpSent(false)
            setError('')
            setSuccess('')
          }}
          className="mt-1 font-semibold text-ink hover:text-gold transition-colors underline underline-offset-4 font-body"
        >
          {mode === 'LOGIN' ? 'Create an Account' : 'Login Here'}
        </button>
      </div>
    </div>
  )
}
