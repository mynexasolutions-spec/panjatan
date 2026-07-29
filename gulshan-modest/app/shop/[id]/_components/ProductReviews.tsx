'use client'

import { useState, useTransition } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import { submitReview } from '@/actions/reviews'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: { full_name: string } | null
}

export default function ProductReviews({ 
  productId, 
  initialReviews 
}: { 
  productId: string
  initialReviews: Review[] 
}) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('rating', rating.toString())
      if (comment.trim()) {
        formData.append('comment', comment.trim())
      }
      
      const result = await submitReview(undefined as any, formData)
      
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Thank you! Your review has been submitted and is pending approval.' })
        setComment('')
        setRating(5)
      }
    })
  }

  // Calculate average
  const avgRating = initialReviews.length > 0 
    ? (initialReviews.reduce((acc, r) => acc + r.rating, 0) / initialReviews.length).toFixed(1)
    : 0

  return (
    <div className="bg-white rounded-2xl border border-cream-line shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-cream-line/50 pb-8">
        <div>
          <h3 className="font-display font-semibold text-2xl text-ink">Customer Reviews</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center text-gold">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${star <= Number(avgRating) ? 'fill-gold' : 'fill-stone-100 text-stone-200'}`} 
                />
              ))}
            </div>
            <span className="font-semibold text-xl text-ink">{avgRating} <span className="text-sm font-medium text-ink/50">out of 5</span></span>
            <span className="text-sm text-ink/40">({initialReviews.length} reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-7 space-y-6">
          {initialReviews.length === 0 ? (
            <div className="text-center py-10 bg-cream/50 rounded-xl border border-dashed border-stone-200">
              <MessageCircle className="w-8 h-8 text-ink/20 mx-auto mb-3" />
              <p className="text-ink/50 text-sm">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            initialReviews.map((review) => (
              <div key={review.id} className="pb-6 border-b border-cream-line/40 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-gold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-gold' : 'fill-stone-100 text-stone-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-ink ml-1">{review.profiles?.full_name || 'Anonymous'}</span>
                  <span className="text-xs text-ink/40 ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && (
                  <p className="text-ink/75 text-sm leading-relaxed mt-2">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="md:col-span-5">
          <div className="bg-cream/30 p-6 rounded-xl border border-cream-line">
            <h4 className="font-semibold text-ink mb-4">Write a Review</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink/70 mb-2">Rating</label>
                <div className="flex items-center gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-6 h-6 ${(hoveredRating || rating) >= star ? 'fill-gold text-gold' : 'fill-stone-100 text-stone-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-ink/70 mb-2">Review (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="What did you like or dislike?"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-ink text-white text-sm font-medium rounded-xl hover:bg-gold transition-colors disabled:opacity-50"
              >
                {isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
