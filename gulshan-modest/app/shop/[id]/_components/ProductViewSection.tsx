'use client'

import React, { useState } from 'react'
import ProductGallery from './ProductGallery'
import ProductDetailActions from './ProductDetailActions'

type ProductImage = {
  image_url: string
  color_name?: string | null
}

type ProductVariant = {
  id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
}

type ProductViewSectionProps = {
  product: {
    id: string
    name: string
    badge: string | null
    rating: number | null
    short_description: string | null
  }
  images: ProductImage[]
  variants: ProductVariant[]
  information: { label: string; value: string }[]
  categoryName: string
}

const COLOR_MAP: Record<string, string> = {
  black: '#1A1A1A',
  white: '#FFFFFF',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  yellow: '#FACC15',
  purple: '#9333EA',
  pink: '#EC4899',
  orange: '#F97316',
  gray: '#6B7280',
  grey: '#6B7280',
  brown: '#78350F',
  olive: '#556B2F',
  cream: '#FFFDD0',
  sage: '#8FBC8F',
  maroon: '#800000',
  gold: '#D4AF37',
  beige: '#F5F5DC',
  navy: '#1E3A8A',
  teal: '#0D9488',
  lavender: '#E6E6FA',
  mustard: '#E1AD01',
  peach: '#FFDAB9',
  mint: '#AAF0D1',
  rust: '#B7410E',
  coral: '#FF7F50',
  emerald: '#059669',
  charcoal: '#374151',
}

function getColorHex(name: string): string {
  const clean = name.toLowerCase().trim()
  return COLOR_MAP[clean] || '#E6DAC4'
}

export default function ProductViewSection({
  product,
  images,
  variants,
  information,
  categoryName,
}: ProductViewSectionProps) {
  // Extract all unique color names assigned to images
  const uniqueColors = Array.from(
    new Set(images.map((img) => img.color_name).filter(Boolean))
  ) as string[]

  const [selectedColor, setSelectedColor] = useState<string | null>(
    uniqueColors.length > 0 ? uniqueColors[0] : null
  )

  // Filter gallery images:
  // Show images matching the selected color, OR images that have NO color assigned (common fallback images)
  const filteredImages = images.filter((img) => {
    if (!selectedColor) return true
    return !img.color_name || img.color_name.toLowerCase().trim() === selectedColor.toLowerCase().trim()
  }).map((img) => img.image_url)

  // Ensure we have at least one image to display
  const displayImages = filteredImages.length > 0 ? filteredImages : (images.map(img => img.image_url) || ['/image.png'])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Left: Product Image Gallery */}
      <ProductGallery images={displayImages} productName={product.name} badge={product.badge || undefined} />

      {/* Right: Product Details & Purchase Form */}
      <div className="space-y-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-gold font-bold">
            {categoryName}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink mt-2 leading-tight">
            {product.name}
          </h1>

          {!!product.rating && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-ink/60">
              <div className="flex text-gold">★★★★★</div>
              <span className="font-semibold text-ink">{product.rating} ★</span>
              <span className="text-ink/30">|</span>
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Dynamic Color Selector */}
        {uniqueColors.length > 0 && (
          <div>
            <p className="text-[13px] uppercase tracking-wider font-bold text-ink/70 mb-3">
              Color {selectedColor ? ` — ${selectedColor}` : ''}
              <span className="ml-1.5 font-semibold normal-case text-emerald">
                ({uniqueColors.length} colors available)
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              {uniqueColors.map((color) => {
                const isSelected = selectedColor?.toLowerCase().trim() === color.toLowerCase().trim()
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`relative w-11 h-11 rounded-full border-2 overflow-hidden shrink-0 transition-all ${
                      isSelected
                        ? 'border-emerald scale-110 shadow-md ring-2 ring-emerald/20'
                        : 'border-cream-line hover:border-emerald/50'
                    }`}
                    style={{ backgroundColor: getColorHex(color) }}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Purchase Actions client-side wrapper */}
        <ProductDetailActions
          product={{
            id: product.id,
            name: product.name,
            image_url: images[0]?.image_url || '/image.png',
            category_name: categoryName,
            variants: variants,
          }}
          selectedColor={selectedColor}
        />

        {product.short_description && (
          <div className="font-body text-ink/80 text-lg leading-relaxed pt-2">
            <p>{product.short_description}</p>
          </div>
        )}

        {/* Dynamic Information Section */}
        {information.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-line/50">
            {information.map((info, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-cream-line shadow-sm">
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">{info.label}</p>
                <p className="text-sm font-semibold text-emerald mt-1">{info.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
