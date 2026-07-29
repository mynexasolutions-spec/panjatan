'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Save, GripVertical } from 'lucide-react'
import { saveProductInformation } from '@/actions/products'

interface InfoItem {
  id?: string
  label: string
  value: string
  display_order: number
}

export default function ProductInfoEditor({
  productId,
  initialItems,
}: {
  productId: string
  initialItems: InfoItem[]
}) {
  const [items, setItems] = useState<InfoItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ label: '', value: '', display_order: 0 }]
  )
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const addItem = () => {
    setItems([
      ...items,
      { label: '', value: '', display_order: items.length },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (
    index: number,
    field: 'label' | 'value',
    value: string
  ) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSave = () => {
    const validItems = items.filter(
      (item) => item.label.trim() && item.value.trim()
    )

    startTransition(async () => {
      const result = await saveProductInformation(productId, validItems)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Information saved!' })
        setTimeout(() => setMessage(null), 3000)
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-900">
            Additional Information
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Product specifications displayed in a table (e.g. Brand, Shelf
            Life, Storage)
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Row
        </button>
      </div>

      {message && (
        <div
          className={`p-2.5 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-stone-300 shrink-0" />
            <input
              type="text"
              maxLength={100}
              value={item.label}
              onChange={(e) => updateItem(index, 'label', e.target.value)}
              placeholder="Label (e.g. Brand)"
              className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
            />
            <input
              type="text"
              maxLength={1000}
              value={item.value}
              onChange={(e) => updateItem(index, 'value', e.target.value)}
              placeholder="Value (e.g. Gulshan Modest)"
              className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-60 transition-colors"
      >
        {isPending ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        Save Information
      </button>
    </div>
  )
}
