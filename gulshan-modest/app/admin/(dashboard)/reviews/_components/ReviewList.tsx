'use client'

import { useState } from 'react'
import { approveReview, deleteReview } from '@/actions/admin/reviews'
import { Star, CheckCircle, Trash2, Clock } from 'lucide-react'

type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  review_text: string | null
  is_approved: boolean
  created_at: string
  products: { name: string } | null
  profiles: { full_name: string; email: string } | null
}

export function ReviewList({ initialReviews }: { initialReviews: Review[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  async function handleApprove(id: string) {
    if (!confirm('Approve this review? It will become visible on the product page.')) return
    
    setIsProcessing(id)
    const formData = new FormData()
    formData.append('id', id)
    
    const result = await approveReview({}, formData)
    if (result.error) {
      alert(result.error)
    }
    setIsProcessing(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) return
    
    setIsProcessing(id)
    const formData = new FormData()
    formData.append('id', id)
    
    const result = await deleteReview({}, formData)
    if (result.error) {
      alert(result.error)
    }
    setIsProcessing(null)
  }

  if (initialReviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <p className="text-stone-500">No reviews found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Rating</th>
              <th className="p-4 font-semibold">Review</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {initialReviews.map((review) => (
              <tr key={review.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4">
                  {review.is_approved ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-medium text-stone-900">{review.products?.name || 'Unknown Product'}</div>
                  <div className="text-xs text-stone-500">ID: {review.product_id.substring(0, 8)}...</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-stone-900">{review.profiles?.full_name || 'Anonymous'}</div>
                  <div className="text-xs text-stone-500">{review.profiles?.email || ''}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'}`} 
                      />
                    ))}
                  </div>
                </td>
                <td className="p-4 max-w-xs">
                  <p className="text-sm text-stone-600 truncate" title={review.review_text || ''}>
                    {review.review_text || <span className="italic text-stone-400">No text</span>}
                  </p>
                  <div className="text-xs text-stone-400 mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {!review.is_approved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={isProcessing === review.id}
                        className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve Review"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isProcessing === review.id}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
