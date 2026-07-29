'use client'

import { useState, useTransition, useActionState } from 'react'
import { createCategory, updateCategory, type ActionResult } from '@/actions/categories'
import Link from 'next/link'
import Image from 'next/image'
import { Save, ArrowLeft, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  category?: Category
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const isEditing = !!category
  const action = isEditing ? updateCategory : createCategory

  const [imageUrl, setImageUrl] = useState<string | null>(category?.image_url || null)
  const [isUploading, setIsUploading] = useState(false)

  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {}
  )
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="space-y-6"
    >
      {/* Hidden ID for edit */}
      {isEditing && <input type="hidden" name="id" value={category.id} />}

      {/* Error */}
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="category-name"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            id="category-name"
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={category?.name || ''}
            placeholder="e.g. Whole Spices"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
          />
          <p className="text-xs text-stone-400 mt-1.5">
            A URL-friendly slug will be auto-generated from the name.
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="category-description"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Description
          </label>
          <textarea
            id="category-description"
            name="description"
            rows={3}
            maxLength={1000}
            defaultValue={category?.description || ''}
            placeholder="Optional description for this category"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-none"
          />
        </div>

        {/* Category Image */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Category Image (Optional)
          </label>
          <input type="hidden" name="image_url" value={imageUrl || ''} />
          
          {imageUrl ? (
            <div className="relative w-full max-w-sm aspect-video rounded-xl border border-stone-200 overflow-hidden bg-stone-100">
              <Image 
                src={imageUrl} 
                alt="Category Image Preview" 
                fill 
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-stone-700 hover:text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <CldUploadWidget 
              signatureEndpoint="/api/cloudinary/sign"
              options={{
                maxFiles: 1,
                resourceType: "image",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"]
              }}
              onSuccess={(result: any) => {
                setImageUrl(result.info.secure_url)
                setIsUploading(false)
              }}
              onOpen={() => setIsUploading(true)}
              onError={() => setIsUploading(false)}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  disabled={isUploading || pending}
                  className="w-full max-w-sm aspect-video flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100 hover:border-orange-400 hover:text-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                  <span className="text-sm font-medium">Click to upload an image</span>
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            id="category-active"
            name="is_active"
            type="checkbox"
            defaultChecked={category?.is_active ?? true}
            className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
          />
          <label
            htmlFor="category-active"
            className="text-sm font-medium text-stone-700"
          >
            Active — visible to customers
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {pending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}
