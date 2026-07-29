'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteCategory, toggleCategoryStatus } from '@/actions/categories'
import { useState, useTransition } from 'react'
import type { Category } from '@/types/database'

export default function CategoryRow({ category }: { category: Category }) {
  const [isPending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)

  if (deleted) return null

  return (
    <tr className="hover:bg-stone-50/50 transition-colors">
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-10 h-10 rounded-lg object-cover bg-stone-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-medium">
              IMG
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-stone-900">{category.name}</p>
            {category.description && (
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <code className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
          {category.slug}
        </code>
      </td>
      <td className="px-6 py-3.5">
        <button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await toggleCategoryStatus(category.id, !category.is_active)
            })
          }}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            category.is_active
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
          }`}
        >
          {category.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-3.5 text-sm text-stone-500">
        {new Date(category.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="px-6 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="p-2 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            disabled={isPending}
            onClick={() => {
              if (confirm('Are you sure you want to delete this category?')) {
                startTransition(async () => {
                  const result = await deleteCategory(category.id)
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
