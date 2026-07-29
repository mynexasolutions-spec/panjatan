'use client'

import React, { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'
import { SITE } from '@/lib/data'
import { ShoppingBag, CreditCard, Plus, Minus } from 'lucide-react'

export type ProductVariant = {
  id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
}

type ProductItem = {
  id: string
  name: string
  image_url: string
  category_name?: string
  variants: ProductVariant[]
}

export default function ProductDetailActions({ product, selectedColor = null }: { product: ProductItem, selectedColor?: string | null }) {
  const { addToCart, updateQuantity, cart } = useCart()
  const { showToast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  )

  // Filter variants based on selectedColor if they are named like "Color - Size" or "Color Size"
  const filteredVariants = React.useMemo(() => {
    if (!selectedColor) return product.variants

    const colorLower = selectedColor.toLowerCase().trim()
    const matching = product.variants.filter(v => 
      v.variant_name.toLowerCase().includes(colorLower)
    )

    if (matching.length > 0) return matching
    return product.variants
  }, [product.variants, selectedColor])

  // Automatically update selected variant when the filtered variants change (e.g., when switching colors)
  React.useEffect(() => {
    if (filteredVariants.length > 0) {
      // If current selected variant is not in the filtered list, switch to the first matching one
      if (!selectedVariant || !filteredVariants.some(v => v.id === selectedVariant.id)) {
        const firstInStock = filteredVariants.find(v => v.stock_quantity > 0)
        setSelectedVariant(firstInStock || filteredVariants[0])
      }
    } else {
      setSelectedVariant(null)
    }
  }, [filteredVariants])

  // Get clean display name for the variant button (e.g., "Black - M" -> "M")
  const getDisplayName = (variantName: string) => {
    if (!selectedColor) return variantName
    const colorLower = selectedColor.toLowerCase().trim()
    if (variantName.toLowerCase().includes(colorLower)) {
      const regex = new RegExp(colorLower + '\\s*[-/|:\\s]*\\s*', 'i')
      const clean = variantName.replace(regex, '').trim()
      return clean || variantName
    }
    return variantName
  }

  // Use the selected variant price, or fallback to 0 (which shouldn't happen)
  const currentPrice = selectedVariant ? selectedVariant.price : 0
  const currentOldPrice = selectedVariant ? selectedVariant.original_price : null

  // Find if this exact item+variant+color is already in cart
  const cartItemId = `${product.id}-${selectedVariant?.id || 'default'}-${selectedColor || 'default'}`
  const cartItem = cart.find(item => item.cartItemId === cartItemId)
  const currentQty = cartItem ? cartItem.quantity : 0

  const handleAdd = () => {
    if (product.variants.length > 0 && !selectedVariant) {
      showToast("Please select a size/variant first.", "error")
      return
    }

    if (selectedVariant && selectedVariant.stock_quantity < quantity) {
      showToast("Not enough stock available for this variant.", "error")
      return
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: currentPrice,
        image_url: product.image_url,
        category_name: product.category_name,
        variant_id: `${selectedVariant?.id || 'default'}-${selectedColor || 'default'}`,
        variant_name: `${getDisplayName(selectedVariant?.variant_name || '')}${selectedColor ? ` (${selectedColor})` : ''}`
      })
    }
    showToast(`${quantity} × ${product.name} added to cart successfully!`, "success")
  }

  const handleBuyNow = () => {
    handleAdd()
    router.push('/checkout')
  }

  return (
    <div className="space-y-6">
      
      {/* Dynamic Price Display */}
      <div className="flex items-center justify-between pt-3 border-t border-cream-line/50">
        <div className="flex items-baseline gap-3">
          <span className="font-display font-bold text-3xl text-emerald">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {currentOldPrice && (
            <span className="text-ink/40 text-lg line-through">
              ₹{currentOldPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector */}
      {filteredVariants.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[13px] uppercase tracking-wider font-bold text-ink/70">Select Size / Variant</span>
            {selectedVariant && (
              <span className="text-xs font-semibold text-emerald">{selectedVariant.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {filteredVariants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock_quantity <= 0}
                className={`relative min-w-[3.5rem] h-12 px-4 rounded-xl text-[15px] font-bold flex items-center justify-center transition-all duration-300 border-2 overflow-hidden ${
                  selectedVariant?.id === variant.id
                    ? "border-emerald text-emerald bg-emerald/5 shadow-sm scale-[1.02]"
                    : "border-cream-line text-ink/80 hover:border-emerald/40 hover:bg-emerald/5 hover:text-emerald"
                } ${variant.stock_quantity <= 0 ? "opacity-40 cursor-not-allowed bg-cream-deep text-ink/40 border-cream-line line-through" : ""}`}
              >
                {getDisplayName(variant.variant_name)}
                {selectedVariant?.id === variant.id && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-emerald rounded-bl-xl" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4 pt-4 border-t border-cream-line/50">
        {/* Info text if in cart */}
        {currentQty > 0 && (
          <div className="flex">
            <span className="text-xs font-semibold text-emerald bg-emerald/5 border border-emerald/10 px-3 py-1.5 rounded-full">
              {currentQty} currently in your cart
            </span>
          </div>
        )}

        {/* Quantity control */}
        <div className="flex items-center gap-4">
          <span className="text-[13px] uppercase tracking-wider font-bold text-ink/70">Quantity</span>
          <div className="flex items-center border border-cream-line bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1.5 hover:text-emerald text-ink/60 transition-colors rounded-full hover:bg-cream"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-semibold text-ink text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-1.5 hover:text-emerald text-ink/60 transition-colors rounded-full hover:bg-cream"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <button
            onClick={handleAdd}
            disabled={product.variants.length > 0 && !selectedVariant}
            className="w-full py-3.5 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-5 h-5" /> Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.variants.length > 0 && !selectedVariant}
            className="w-full py-3.5 px-4 border-2 border-emerald text-emerald font-body font-semibold rounded-full hover:bg-emerald hover:text-cream transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
