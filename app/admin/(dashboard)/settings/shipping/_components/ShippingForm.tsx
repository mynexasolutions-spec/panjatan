'use client'

import { useTransition, useState } from 'react'
import { updateShippingSettings } from '@/actions/admin/shipping'
import { Truck, CircleDollarSign, CheckCircle } from 'lucide-react'

export default function ShippingForm({ initialShipping }: { initialShipping: any }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const flatRate = parseFloat(formData.get('flatRate') as string)
    const freeThreshold = parseFloat(formData.get('freeThreshold') as string)
    const codCharge = parseFloat(formData.get('codCharge') as string)
    const onlineDiscount = parseFloat(formData.get('onlineDiscount') as string)

    if (isNaN(flatRate) || isNaN(freeThreshold) || isNaN(codCharge) || isNaN(onlineDiscount)) {
      setMessage({ type: 'error', text: 'Please enter valid numbers.' })
      return
    }

    startTransition(async () => {
      const res = await updateShippingSettings(flatRate, freeThreshold, codCharge, onlineDiscount)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Shipping & Payment charges updated successfully!' })
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
          Flat Shipping Rate (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="flatRate"
            defaultValue={initialShipping.flat_rate ?? 99}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Free Shipping Threshold (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="freeThreshold"
            defaultValue={initialShipping.free_threshold ?? 1999}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Cash on Delivery (COD) Charge (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="codCharge"
            defaultValue={initialShipping.cod_charge ?? 50}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Online Payment Discount (%)
        </label>
        <div className="relative">
          <input
            type="number"
            name="onlineDiscount"
            defaultValue={initialShipping.online_discount ?? 0}
            required
            min="0"
            max="100"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
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
            <CheckCircle className="w-4.5 h-4.5" />
            Save Shipping Charges
          </>
        )}
      </button>
    </form>
  )
}
