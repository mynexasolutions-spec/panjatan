'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus, updatePaymentStatus } from '@/actions/admin/orders'
import { Check, Loader2 } from 'lucide-react'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export function OrderStatusManager({ 
  orderId, 
  initialOrderStatus, 
  initialPaymentStatus 
}: { 
  orderId: string
  initialOrderStatus: string
  initialPaymentStatus: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleStatusChange = (type: 'order' | 'payment', value: string) => {
    setError(null)
    setSuccess(false)
    
    startTransition(async () => {
      const result = type === 'order' 
        ? await updateOrderStatus(orderId, value)
        : await updatePaymentStatus(orderId, value)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-900">Manage Status</h3>
        {isPending && <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />}
        {success && !isPending && <Check className="w-5 h-5 text-green-500" />}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          Order Status
        </label>
        <select
          disabled={isPending}
          defaultValue={initialOrderStatus}
          onChange={(e) => handleStatusChange('order', e.target.value)}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all capitalize"
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          Payment Status
        </label>
        <select
          disabled={isPending}
          defaultValue={initialPaymentStatus}
          onChange={(e) => handleStatusChange('payment', e.target.value)}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all capitalize"
        >
          {PAYMENT_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
