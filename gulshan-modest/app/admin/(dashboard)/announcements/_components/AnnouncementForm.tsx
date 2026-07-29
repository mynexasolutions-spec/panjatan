'use client'

import { useState, useTransition } from 'react'
import { saveAnnouncement } from '@/actions/admin/announcements'
import { Check, Loader2, Megaphone } from 'lucide-react'

export function AnnouncementForm({ 
  initialMessage, 
  initialIsActive 
}: { 
  initialMessage: string
  initialIsActive: boolean 
}) {
  const [message, setMessage] = useState(initialMessage)
  const [isActive, setIsActive] = useState(initialIsActive)
  
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = () => {
    if (!message.trim() && isActive) {
      setError('Message cannot be empty when announcement is active.')
      return
    }

    setError(null)
    setSuccess(false)
    
    startTransition(async () => {
      const result = await saveAnnouncement(message, isActive)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-8">
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-6">
        
        {/* Toggle */}
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200/60">
          <div>
            <h3 className="font-bold text-stone-900">Enable Announcement Banner</h3>
            <p className="text-sm text-stone-500">Show this banner to all visitors at the top of the store.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isPending}
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">
            Announcement Message
          </label>
          <div className="relative">
            <Megaphone className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
            <input
              type="text"
              maxLength={255}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Free Shipping on all orders over ₹500!"
              disabled={isPending}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-stone-400"
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">Keep it short and engaging for the best results.</p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-stone-100 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
          
          {success && (
            <span className="flex items-center gap-2 text-sm font-medium text-green-600">
              <Check className="w-4 h-4" />
              Saved successfully!
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
