'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteProduct } from '@/actions/products'
import { useState, useTransition } from 'react'

interface ProductWithCategory {
  id: string
  name: string
  slug: string
  short_description: string | null
  featured_image_url?: string | null
  image_url?: string | null
  badge?: string | null
  is_active: boolean
  created_at: string
  categories: { name: string } | null
}

export default function ProductRow({
  product,
}: {
  product: ProductWithCategory
}) {
  const [isPending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)

  if (deleted) return null

  const displayImage = product.image_url || product.featured_image_url

  return (
    <tr className="hover:bg-stone-50/50 transition-colors">
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover bg-stone-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-medium">
              IMG
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-stone-900">{product.name}</p>
            <p className="text-xs text-stone-400 mt-0.5">/{product.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5">
        {product.categories ? (
          <span className="text-sm text-stone-600">
            {product.categories.name}
          </span>
        ) : (
          <span className="text-xs text-stone-400 italic">Uncategorized</span>
        )}
      </td>
      <td className="px-6 py-3.5">
        {product.badge ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            {product.badge}
          </span>
        ) : (
          <span className="text-xs text-stone-400 italic">None</span>
        )}
      </td>
      <td className="px-6 py-3.5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-3.5 text-sm text-stone-500">
        {new Date(product.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="px-6 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="p-2 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            disabled={isPending}
            onClick={() => {
              if (
                confirm(
                  'Are you sure? This will also delete all variants, images, and FAQs for this product.'
                )
              ) {
                startTransition(async () => {
                  const result = await deleteProduct(product.id)
                  if (result.success) setDeleted(true)
                })
              }
            }}
            className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
