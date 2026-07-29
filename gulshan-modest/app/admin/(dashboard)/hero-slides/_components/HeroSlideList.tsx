'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createHeroSlide, deleteHeroSlide, toggleHeroSlideStatus } from '@/actions/admin/hero'
import { Trash2, Plus, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

export function HeroSlideList({ 
  initialSlides, 
  position = 'right',
  title = 'Background Images & Slides'
}: { 
  initialSlides: any[], 
  position?: 'left' | 'right',
  title?: string
}) {
  const [slides, setSlides] = useState(initialSlides)
  const [isPending, startTransition] = useTransition()

  const handleUploadSuccess = (result: any) => {
    const imageUrl = result.info.secure_url
    
    startTransition(async () => {
      const res = await createHeroSlide(imageUrl, position)
      if (res.success) {
        window.location.reload()
      } else {
        alert(res.error)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this background image?')) return
    
    startTransition(async () => {
      const res = await deleteHeroSlide(id)
      if (res.success) {
        setSlides(slides.filter(s => s.id !== id))
      }
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleHeroSlideStatus(id, !currentStatus)
      if (res.success) {
        setSlides(slides.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s))
      }
    })
  }

  const activeCount = slides.filter(s => s.is_active).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900">{title}</h2>
        </div>
        
        {slides.length < 5 ? (
          <CldUploadWidget 
            signatureEndpoint="/api/cloudinary/sign"
            options={{
              maxFiles: 1,
              resourceType: "image",
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp"]
            }}
            onSuccess={handleUploadSuccess}
          >
            {({ open }) => (
              <button
                onClick={() => open()}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Slide
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Maximum 5 slides reached
          </span>
        )}
      </div>

      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        Upload high-quality images (16:9 ratio recommended). They will loop automatically. You have {activeCount} active slides.
      </p>

      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
            <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-900">No slides created</p>
            <p className="text-sm text-stone-500 mt-1">Upload an image to start building your hero section.</p>
          </div>
        ) : (
          slides.map((slide, index) => {
            return (
              <div key={slide.id} className={`flex flex-col rounded-xl border transition-all overflow-hidden ${slide.is_active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'}`}>
                
                {/* Slide Header Row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="cursor-move text-stone-400 hover:text-stone-600 p-1">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="h-16 w-28 shrink-0 rounded-lg overflow-hidden relative bg-stone-200 border border-stone-200">
                    <Image
                      src={slide.image_url}
                      alt="Hero Background"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900">Slide {index + 1}</p>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {slide.image_url.split('/').pop()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={slide.is_active}
                        onChange={() => handleToggle(slide.id, slide.is_active)}
                        disabled={isPending || (!slide.is_active && activeCount >= 5)}
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    
                    <button
                      onClick={() => handleDelete(slide.id)}
                      disabled={isPending}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-1"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {isPending && (
        <div className="mt-4 flex items-center justify-center text-sm text-stone-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </div>
      )}

    </div>
  )
}
