'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import {
  createHomeBannerImage,
  deleteHomeBannerImage,
  setHomeBannerEnabled,
  toggleHomeBannerImageStatus,
  updateHomeBannerImageLink,
} from '@/actions/admin/homeBanner'
import { Trash2, Plus, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

type BannerImage = {
  id: string
  image_url: string
  link_url: string | null
  is_active: boolean
}

export function HomeBannerManager({
  initialEnabled,
  initialImages,
}: {
  initialEnabled: boolean
  initialImages: BannerImage[]
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [images, setImages] = useState<BannerImage[]>(initialImages)
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialImages.map((img) => [img.id, img.link_url || '']))
  )
  const [isPending, startTransition] = useTransition()

  const activeCount = images.filter((i) => i.is_active).length

  const handleToggleEnabled = () => {
    const next = !enabled
    setEnabled(next)
    startTransition(async () => {
      const res = await setHomeBannerEnabled(next)
      if (!res.success) {
        setEnabled(!next)
        alert(res.error)
      }
    })
  }

  const handleUploadSuccess = (result: any) => {
    const imageUrl = result.info.secure_url

    startTransition(async () => {
      const res = await createHomeBannerImage(imageUrl, '')
      if (res.success) {
        window.location.reload()
      } else {
        alert(res.error)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this banner image?')) return

    startTransition(async () => {
      const res = await deleteHomeBannerImage(id)
      if (res.success) {
        setImages(images.filter((i) => i.id !== id))
      }
    })
  }

  const handleToggleImage = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleHomeBannerImageStatus(id, !currentStatus)
      if (res.success) {
        setImages(images.map((i) => (i.id === id ? { ...i, is_active: !currentStatus } : i)))
      }
    })
  }

  const handleLinkBlur = (id: string) => {
    const linkUrl = linkDrafts[id] || ''
    startTransition(async () => {
      await updateHomeBannerImageLink(id, linkUrl)
      setImages(images.map((i) => (i.id === id ? { ...i, link_url: linkUrl || null } : i)))
    })
  }

  return (
    <div className="space-y-6">
      {/* Enable / Disable */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Show Banner on Homepage</h2>
          <p className="text-sm text-stone-500 mt-1">
            Turn this on once you've added at least one active image below.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={handleToggleEnabled}
            disabled={isPending}
          />
          <div className="w-12 h-7 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-stone-400" />
            <h2 className="text-lg font-bold text-stone-900">Banner Images</h2>
          </div>

          {images.length < 8 ? (
            <CldUploadWidget
              signatureEndpoint="/api/cloudinary/sign"
              options={{
                maxFiles: 1,
                resourceType: 'image',
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
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
                  Add Image
                </button>
              )}
            </CldUploadWidget>
          ) : (
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Maximum 8 images reached
            </span>
          )}
        </div>

        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          Upload images in a 3:1 landscape ratio (e.g. 1800×600px) for the best fit — a wide, short strip rather than a tall banner. They auto-swipe on the homepage. You have {activeCount} active image{activeCount === 1 ? '' : 's'}.
        </p>

        <div className="space-y-4">
          {images.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
              <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-900">No banner images yet</p>
              <p className="text-sm text-stone-500 mt-1">Upload a 3:1 image (e.g. 1800×600px) to start building the banner.</p>
            </div>
          ) : (
            images.map((img, index) => (
              <div
                key={img.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  img.is_active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-32 aspect-[3/1] shrink-0 rounded-lg overflow-hidden relative bg-stone-200 border border-stone-200">
                    <Image src={img.image_url} alt={`Banner ${index + 1}`} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-semibold text-stone-900">Banner {index + 1}</p>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={linkDrafts[img.id] ?? ''}
                        onChange={(e) => setLinkDrafts({ ...linkDrafts, [img.id]: e.target.value })}
                        onBlur={() => handleLinkBlur(img.id)}
                        placeholder="/shop or https://... (optional link when clicked)"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={img.is_active}
                        onChange={() => handleToggleImage(img.id, img.is_active)}
                        disabled={isPending}
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>

                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={isPending}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-1"
                      title="Delete Image"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isPending && (
          <div className="mt-4 flex items-center justify-center text-sm text-stone-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </div>
  )
}
