'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'
import { createProductVariant, updateProductVariant, deleteProductVariant, bulkCreateProductVariants } from '@/actions/products'

type Variant = {
  id: string
  product_id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
  is_active: boolean
}

type BulkVariantForm = {
  id: string
  variant_name: string
  price: string
  original_price: string
  stock_quantity: string
  is_active: boolean
}

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function ProductVariantsEditor({
  productId,
  variants,
  colorName,
}: {
  productId: string
  variants: Variant[]
  colorName?: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('All')

  // Derive colors
  const productColors = (() => {
    if (!colorName) return []
    try {
      if (colorName.startsWith('[')) {
        const parsed = JSON.parse(colorName) as { name: string; hex: string }[]
        return parsed.map(c => c.name.trim()).filter(Boolean)
      }
    } catch (e) {}
    return colorName.split(',').map(c => c.trim()).filter(Boolean)
  })()

  // Automatically update active tab based on view state
  useEffect(() => {
    if (productColors.length > 0) {
      if (isAdding) {
        setActiveTab('General')
      } else {
        setActiveTab(productColors[0])
      }
    } else {
      setActiveTab('All')
    }
  }, [isAdding, colorName])

  // Filter variants for display based on active color tab
  const displayedVariants = variants.filter(v => {
    if (activeTab === 'All') return true
    
    const variantNameLower = v.variant_name.toLowerCase().trim()
    
    // Check if it matches the selected color tab
    return variantNameLower.includes(activeTab.toLowerCase().trim())
  })

  // Single Edit Form State
  const [formData, setFormData] = useState({
    variant_name: '',
    price: '',
    original_price: '',
    stock_quantity: '0',
    is_active: true,
  })

  // Bulk Add Form State
  const [bulkData, setBulkData] = useState<BulkVariantForm[]>([])

  const initializeBulkForm = () => {
    // Start bulk form with just standard sizes (acting as the General Template)
    setBulkData(STANDARD_SIZES.map(size => ({
      id: crypto.randomUUID(),
      variant_name: size,
      price: '',
      original_price: '',
      stock_quantity: '0',
      is_active: true
    })))
    setIsAdding(true)
    setEditingId(null)
    setActiveTab(productColors.length > 0 ? 'General' : 'All')
  }

  const handleApplyToAllColors = () => {
    // Get general template rows (rows that do not contain any of the color names)
    const generalRows = bulkData.filter(row => {
      const nameLower = row.variant_name.toLowerCase().trim()
      return !productColors.some(color => 
        nameLower.includes(color.toLowerCase().trim())
      )
    })

    // Filter out template rows that are empty (no price filled)
    const activeTemplates = generalRows.filter(r => r.price.trim() !== '')

    if (activeTemplates.length === 0) {
      alert("Please fill in at least one size with a price first.")
      return
    }

    // Generate color-specific combinations
    const newCombinations: BulkVariantForm[] = []
    productColors.forEach(color => {
      activeTemplates.forEach(tpl => {
        newCombinations.push({
          id: crypto.randomUUID(),
          variant_name: `${color} - ${tpl.variant_name}`,
          price: tpl.price,
          original_price: tpl.original_price,
          stock_quantity: tpl.stock_quantity,
          is_active: tpl.is_active
        })
      })
    })

    // Update bulk data, keeping the general templates plus the new generated combinations
    setBulkData(prev => {
      // Remove any existing rows that start with color names to avoid duplicates
      const filteredPrev = prev.filter(r => {
        const nameLower = r.variant_name.toLowerCase().trim()
        return !productColors.some(color => 
          nameLower.startsWith(color.toLowerCase().trim())
        )
      })
      return [...filteredPrev, ...newCombinations]
    })

    // Switch tab to first color to let them review
    setActiveTab(productColors[0] || 'All')
  }

  const addCustomSizeRow = () => {
    const defaultPrefix = activeTab !== 'All' && activeTab !== 'General' ? `${activeTab} - ` : ''
    setBulkData(prev => [...prev, {
      id: crypto.randomUUID(),
      variant_name: defaultPrefix,
      price: '',
      original_price: '',
      stock_quantity: '0',
      is_active: true
    }])
  }

  const removeBulkRow = (id: string) => {
    setBulkData(prev => prev.filter(r => r.id !== id))
  }

  const updateBulkRow = (id: string, field: keyof BulkVariantForm, value: string | boolean) => {
    setBulkData(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const resetForm = () => {
    setFormData({
      variant_name: '',
      price: '',
      original_price: '',
      stock_quantity: '0',
      is_active: true,
    })
    setBulkData([])
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (variant: Variant) => {
    setFormData({
      variant_name: variant.variant_name,
      price: variant.price.toString(),
      original_price: variant.original_price ? variant.original_price.toString() : '',
      stock_quantity: variant.stock_quantity.toString(),
      is_active: variant.is_active,
    })
    setEditingId(variant.id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this size option?')) {
      startTransition(async () => {
        await deleteProductVariant(id, productId)
      })
    }
  }

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const fd = new FormData()
      fd.append('product_id', productId)
      fd.append('variant_name', formData.variant_name)
      fd.append('price', formData.price)
      if (formData.original_price) fd.append('original_price', formData.original_price)
      fd.append('stock_quantity', formData.stock_quantity)
      if (formData.is_active) fd.append('is_active', 'on')

      if (editingId) {
        fd.append('id', editingId)
        await updateProductVariant({}, fd)
      }
      resetForm()
    })
  }

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out rows that are completely empty or missing required fields
    const validRows = bulkData.filter(r => r.variant_name.trim() !== '' && r.price.trim() !== '')
    
    if (validRows.length === 0) {
      alert("Please fill in at least one size option with a name and price.")
      return
    }

    startTransition(async () => {
      const formattedVariants = validRows.map(r => ({
        variant_name: r.variant_name,
        price: parseFloat(r.price),
        original_price: r.original_price ? parseFloat(r.original_price) : null,
        stock_quantity: parseInt(r.stock_quantity || '0', 10),
        is_active: r.is_active
      }))
      
      await bulkCreateProductVariants(productId, formattedVariants)
      resetForm()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Size Options</h3>
        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={initializeBulkForm}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Size Options
          </button>
        )}
      </div>

      {/* Color Filter Tabs */}
      {productColors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
          {isAdding && (
            <button
              type="button"
              onClick={() => setActiveTab('General')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'General'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              General Template
            </button>
          )}
          
          {productColors.map((color) => {
            const count = isAdding
              ? bulkData.filter(v => v.variant_name.toLowerCase().includes(color.toLowerCase().trim())).length
              : variants.filter(v => v.variant_name.toLowerCase().includes(color.toLowerCase().trim())).length
            return (
              <button
                key={color}
                type="button"
                onClick={() => setActiveTab(color)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === color
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {color} ({count})
              </button>
            )
          })}

        </div>
      )}

      {/* SINGLE EDIT FORM */}
      {editingId && (
        <form onSubmit={handleSingleSubmit} className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Edit Size Option</h4>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Size Name</label>
              <input
                required
                type="text"
                maxLength={100}
                value={formData.variant_name}
                onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="e.g. M, L, XL"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Price (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Old Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Stock</label>
              <input
                required
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div className="md:col-span-5 flex items-center justify-between mt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* BULK ADD FORM */}
      {isAdding && (
        <form onSubmit={handleBulkSubmit} className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Quick Add Size Options</h4>
              <p className="text-xs text-gray-500 mt-1">Fill in the prices and stock for the standard sizes, or add custom ones.</p>
            </div>
            <button
              type="button"
              onClick={addCustomSizeRow}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Custom Size
            </button>
          </div>

          {activeTab === 'General' && productColors.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-indigo-900">Apply to All Colors</h5>
                <p className="text-[11px] text-indigo-700 mt-0.5">Fill in the sizes below once, then click Apply to automatically generate these for all colors ({productColors.join(', ')}).</p>
              </div>
              <button
                type="button"
                onClick={handleApplyToAllColors}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                ✨ Apply for All Colors
              </button>
            </div>
          )}

          <div className="space-y-3">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-2">
              <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Size Name</div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (₹)*</div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Price</div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock*</div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Active</div>
              <div className="col-span-1"></div>
            </div>

            {/* Rows */}
            {bulkData.filter(row => {
              if (activeTab === 'General') {
                // Template sizes that don't contain any of the color names
                const nameLower = row.variant_name.toLowerCase().trim()
                return !productColors.some(color => 
                  nameLower.includes(color.toLowerCase().trim())
                )
              }
              if (activeTab === 'All') return true
              const nameLower = row.variant_name.toLowerCase().trim()
              return nameLower.includes(activeTab.toLowerCase().trim())
            }).map((row) => (
              <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 md:p-2 rounded-lg border border-gray-200 shadow-sm items-center">
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-500 md:hidden mb-1">Size Name</label>
                  <input
                    type="text"
                    value={row.variant_name}
                    onChange={(e) => updateBulkRow(row.id, 'variant_name', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-medium text-gray-900"
                    placeholder="e.g. XL"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 md:hidden mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.price}
                    onChange={(e) => updateBulkRow(row.id, 'price', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 md:hidden mb-1">Old Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.original_price}
                    onChange={(e) => updateBulkRow(row.id, 'original_price', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="Optional"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 md:hidden mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={row.stock_quantity}
                    onChange={(e) => updateBulkRow(row.id, 'stock_quantity', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
                <div className="md:col-span-2 flex justify-start md:justify-center items-center mt-2 md:mt-0">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.is_active}
                      onChange={(e) => updateBulkRow(row.id, 'is_active', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="ml-2 text-sm text-gray-600 md:hidden">Active</span>
                  </label>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeBulkRow(row.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
                    title="Remove Size"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || bulkData.length === 0}
              className="inline-flex items-center px-6 py-2 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save All Sizes
            </button>
          </div>
        </form>
      )}

      {variants.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-xl">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Size</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {displayedVariants.map((variant) => (
                  <tr key={variant.id} className={editingId === variant.id ? 'bg-indigo-50' : 'hover:bg-gray-50/50 transition-colors'}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-gray-900">
                      {variant.variant_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">₹{variant.price}</span>
                        {variant.original_price && (
                          <span className="text-xs text-gray-400 line-through">₹{variant.original_price}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {variant.stock_quantity}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {variant.is_active ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(variant)}
                          disabled={isPending}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded hover:bg-indigo-100 transition-colors"
                          title="Edit Size"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variant.id)}
                          disabled={isPending}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded hover:bg-red-100 transition-colors"
                          title="Delete Size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-sm font-semibold text-gray-600">No size options added yet.</p>
          <p className="text-sm text-gray-500 mt-2">Add sizes like "S", "M", "L" to this product.</p>
        </div>
      )}
    </div>
  )
}

