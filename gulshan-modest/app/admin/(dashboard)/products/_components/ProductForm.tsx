'use client'

import { useTransition, useActionState, useState } from 'react'
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from '@/actions/products'
import Link from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'
import type { Category, Product } from '@/types/database'

type OtherProduct = Pick<Product, 'id' | 'name' | 'color_group_id' | 'color_name'>

interface ProductFormProps {
  product?: Product
  categories: Category[]
  otherProducts?: OtherProduct[]
}

export default function ProductForm({ product, categories, otherProducts = [] }: ProductFormProps) {
  const isEditing = !!product
  const action = isEditing ? updateProduct : createProduct

  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {}
  )
  const [pending, startTransition] = useTransition()

  // Parse initial colors from JSON or legacy format
  const initialColors = (() => {
    if (!product?.color_name) return []
    try {
      if (product.color_name.startsWith('[')) {
        return JSON.parse(product.color_name) as { name: string; hex: string }[]
      }
    } catch (e) {}
    // Fallback for legacy comma-separated values
    return product.color_name.split(',').map(c => ({ name: c.trim(), hex: '#E6DAC4' })).filter(c => c.name)
  })()

  const [colorsList, setColorsList] = useState<{ name: string; hex: string }[]>(initialColors)
  const [colorInputName, setColorInputName] = useState('')
  const [colorInputHex, setColorInputHex] = useState('#1E3B2E')

  const handleAddColor = () => {
    const name = colorInputName.trim()
    if (!name) return
    if (colorsList.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return
    }
    setColorsList([...colorsList, { name, hex: colorInputHex }])
    setColorInputName('')
  }

  const handleRemoveColor = (nameToRemove: string) => {
    setColorsList(colorsList.filter(c => c.name !== nameToRemove))
  }

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="space-y-6"
    >
      {isEditing && <input type="hidden" name="id" value={product.id} />}

      {/* Error */}
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  required
                  maxLength={255}
                  defaultValue={product?.name || ''}
                  placeholder="e.g. Premium Front Open Abaya"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
                <p className="text-xs text-stone-400 mt-1.5">
                  Slug will be auto-generated from the name.
                </p>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="product-category"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="product-category"
                  name="category_id"
                  required
                  defaultValue={product?.category_id || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label
                htmlFor="product-short-desc"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Short Description
              </label>
              <textarea
                id="product-short-desc"
                name="short_description"
                rows={3}
                maxLength={500}
                defaultValue={product?.short_description || ''}
                placeholder="Brief one-liner about the product"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Fabric Details */}
              <div>
                <label
                  htmlFor="product-fabric"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Fabric Details
                </label>
                <input
                  id="product-fabric"
                  name="fabric"
                  type="text"
                  defaultValue={(product as any)?.fabric || ''}
                  placeholder="e.g. Premium quality nida/crepe"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
              </div>

              {/* Stitching Details */}
              <div>
                <label
                  htmlFor="product-stitching"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Stitching Details
                </label>
                <input
                  id="product-stitching"
                  name="stitching"
                  type="text"
                  defaultValue={(product as any)?.stitching || ''}
                  placeholder="e.g. Dual-reinforced seams"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="product-description"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Full Description
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={14}
                maxLength={5000}
                defaultValue={product?.description || ''}
                placeholder="Detailed product description..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-y"
              />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">SEO</h2>

            <div>
              <label
                htmlFor="seo-title"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                SEO Title
              </label>
              <input
                id="seo-title"
                name="seo_title"
                type="text"
                maxLength={60}
                defaultValue={product?.seo_title || ''}
                placeholder="Custom title for search engines"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="seo-description"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                SEO Description
              </label>
              <textarea
                id="seo-description"
                name="seo_description"
                rows={5}
                maxLength={160}
                defaultValue={product?.seo_description || ''}
                placeholder="Meta description for search results"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">Status</h2>

            {/* Badge / Tag */}
            <div>
              <label
                htmlFor="product-badge"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Badge / Tag
              </label>
              <select
                id="product-badge"
                name="badge"
                defaultValue={product?.badge || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
              >
                <option value="">No badge</option>
                <option value="New">New</option>
                <option value="Hot">Hot</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Premium">Premium</option>
                <option value="Popular">Popular</option>
                <option value="Luxe">Luxe</option>
                <option value="Handcrafted">Handcrafted</option>
              </select>
              <p className="text-xs text-stone-400 mt-1.5">
                Shown as a small tag on the product card in the storefront.
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                id="product-active"
                name="is_active"
                type="checkbox"
                defaultChecked={product?.is_active ?? true}
                className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
              />
              <label
                htmlFor="product-active"
                className="text-sm font-medium text-stone-700"
              >
                Active — visible in the store
              </label>
            </div>

            {/* Featured Status */}
            <div className="flex items-center gap-3">
              <input
                id="product-featured"
                name="is_featured"
                type="checkbox"
                defaultChecked={product?.is_featured ?? false}
                className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
              />
              <label
                htmlFor="product-featured"
                className="text-sm font-medium text-stone-700"
              >
                Featured — highlight on homepage
              </label>
            </div>
          </div>
          {/* Colors Management */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">Product Colors</h2>
            <p className="text-xs text-stone-400 -mt-3">
              Add the colors available for this product. 
              <strong> Click "Update Product" to save the product and generate these tabs for image uploads below.</strong>
            </p>

            <div className="space-y-4">
              {/* Color List / Tags */}
              {colorsList.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                  {colorsList.map((c) => (
                    <div 
                      key={c.name}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-850 shadow-sm"
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" 
                        style={{ backgroundColor: c.hex }} 
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c.name)}
                        className="text-stone-400 hover:text-red-500 transition-colors ml-1 font-bold text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50">
                  <p className="text-xs text-stone-450">No colors added yet.</p>
                </div>
              )}

              {/* Add New Color Form */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={colorInputName}
                    onChange={(e) => setColorInputName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddColor()
                      }
                    }}
                    placeholder="Color name (e.g. Olive, Cream)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={colorInputHex}
                    onChange={(e) => setColorInputHex(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer shrink-0 p-0.5"
                  />
                  <span className="text-[10px] font-mono text-stone-500 uppercase">{colorInputHex}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Add
                </button>
              </div>

              {/* Hidden field to submit JSON string to backend */}
              <input type="hidden" name="color_name" value={JSON.stringify(colorsList)} />
          </div>
        </div>
      </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
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
          {isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
