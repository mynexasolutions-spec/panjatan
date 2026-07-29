'use client'

import { useTransition, useState } from 'react'
import { updateAdminProfile } from '@/actions/admin/profile'
import { User, Mail, Phone, ShieldCheck } from 'lucide-react'

export default function ProfileForm({ initialProfile }: { initialProfile: any }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateAdminProfile(formData)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <input
            type="text"
            name="fullName"
            defaultValue={initialProfile.full_name || ''}
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            name="email"
            defaultValue={initialProfile.email || ''}
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Phone Number
        </label>
        <div className="relative">
          <input
            type="text"
            name="phone"
            defaultValue={initialProfile.phone || ''}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-700/20 hover:shadow-lg hover:from-teal-800 hover:to-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {pending ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-4.5 h-4.5" />
            Save Profile Changes
          </>
        )}
      </button>
    </form>
  )
}
