'use client'

import React, { useState, useTransition } from 'react'
import { createCoupon } from '@/actions/admin/coupons'
import { Tag, CircleDollarSign, PlusCircle } from 'lucide-react'

export default function CouponForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const form = e.currentTarget
    const formData = new FormData(form)
    const code = formData.get('code') as string
    const type = formData.get('type') as 'percentage' | 'flat'
    const value = parseFloat(formData.get('value') as string)
    const min_purchase = parseFloat(formData.get('min_purchase') as string)

    if (!code || isNaN(value) || isNaN(min_purchase)) {
      setError('Please fill in all fields correctly.')
      return
    }

    startTransition(async () => {
      const res = await createCoupon({
        code,
        type,
        value,
        min_purchase,
        is_active: true
      })

      if (!res.success) {
        setError(res.error || 'Failed to create coupon')
      } else {
        setSuccess('Coupon created successfully!')
        form.reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs">{success}</div>}

      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1">
          Coupon Code
        </label>
        <div className="relative">
          <input
            type="text"
            name="code"
            required
            placeholder="e.g. FESTIVE200"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
          />
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Discount Type
          </label>
          <select
            name="type"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/30"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Value (₹)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Value
          </label>
          <input
            type="number"
            name="value"
            required
            min="1"
            placeholder="e.g. 10 or 150"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1">
          Min Purchase (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="min_purchase"
            required
            min="0"
            placeholder="e.g. 499"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
          />
          <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-gradient-to-r from-teal-700 to-teal-800 text-white text-xs font-semibold rounded-xl hover:from-teal-800 hover:to-teal-900 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        {pending ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            Create Coupon
          </>
        )}
      </button>
    </form>
  )
}
