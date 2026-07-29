'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingBag, ArrowRight } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  oldPrice?: number
  image_url: string
  category_id: string
  badge?: string
  rating: number
  is_active: boolean
  colorCount?: number
  colors?: { name: string; hex: string }[]
}

type Category = {
  id: string
  name: string
}

type ShopGridProps = {
  initialProducts: Product[]
  categories: Category[]
  selectedCategory: string
}

export default function ShopGrid({ initialProducts, categories, selectedCategory }: ShopGridProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedCategory ? [selectedCategory] : []
  )
  const [maxPrice, setMaxPrice] = useState<number>(15000)
  const { addToCart } = useCart()
  const router = useRouter()

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategories([selectedCategory])
    } else {
      setSelectedCategories([])
    }
  }, [selectedCategory])

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // Filter products by category and price
  const filteredProducts = initialProducts.filter(p => {
    if (p.is_active === false) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category_id)) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  const FilterContent = (
    <div className="space-y-8">
      {/* Category Checkboxes */}
      <div>
        <h3 className="font-display font-bold text-xl text-ink mb-4 border-b border-cream-line/60 pb-3">Categories</h3>
        <div className="space-y-3.5">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="hidden" 
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              <div 
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${
                  selectedCategories.includes(cat.id) 
                    ? 'bg-emerald border-emerald' 
                    : 'bg-white border-cream-line group-hover:border-emerald'
                }`}
              >
                {selectedCategories.includes(cat.id) && (
                  <svg className="w-3.5 h-3.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-ink/80 text-[15px] font-medium group-hover:text-emerald transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-cream-line/60 pb-3">
          <h3 className="font-display font-bold text-xl text-ink">Max Price</h3>
          <span className="font-bold text-emerald">₹{maxPrice.toLocaleString('en-IN')}</span>
        </div>
        <input 
          type="range" 
          min="500" 
          max="15000" 
          step="100" 
          value={maxPrice} 
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full cursor-pointer accent-emerald"
        />
        <div className="flex justify-between text-[11px] text-ink/50 mt-3 font-bold uppercase tracking-wider">
          <span>₹500</span>
          <span>₹15,000</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100000] flex lg:hidden">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative mr-auto w-[85%] max-w-sm h-full bg-white p-6 overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-cream-line/60 pb-4">
              <h2 className="font-display font-bold text-2xl text-ink">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-cream rounded-full text-ink/70 hover:text-emerald transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Filter (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-[28px] border border-emerald/10 shadow-lg h-fit sticky top-[100px]">
          {FilterContent}
        </div>

        {/* Main Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-cream-line/50">
            <p className="text-[15px] font-bold text-ink/70">
              Showing <span className="text-emerald">{filteredProducts.length}</span> products
            </p>
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-emerald text-cream rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-ink/50 bg-white rounded-[28px] border border-emerald/10 shadow-lg">
              No products match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => {
              const catName = categories.find(c => c.id === p.category_id)?.name || p.category_id
              return (
                <div key={p.id} className="lift group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-cream-line/80 flex flex-col">
                  <Link href={`/shop/${p.id}`} className="relative aspect-[4/5] overflow-hidden block bg-cream-deep/20">
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    {p.badge && (
                      <span className="absolute top-3 left-3 bg-emerald text-cream text-[9px] md:text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-sm">
                        {p.badge}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-gold text-cream text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded shadow-sm">
                      {catName}
                    </span>
                  </Link>

                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <div className="flex-1">
                      <Link href={`/shop/${p.id}`} className="hover:text-emerald transition-colors">
                        <h3 className="font-display font-semibold text-ink text-[13px] md:text-[15px] leading-snug line-clamp-2">
                          {p.name}
                        </h3>
                      </Link>
                      {p.colors && p.colors.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {p.colors.slice(0, 5).map((colorObj) => (
                            <span
                              key={colorObj.name}
                              title={colorObj.name}
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-sm"
                              style={{ backgroundColor: colorObj.hex }}
                            />
                          ))}
                          {p.colors.length > 5 && (
                            <span className="text-[10px] text-ink/50 font-medium">
                              +{p.colors.length - 5}
                            </span>
                          )}
                        </div>
                      ) : (
                        p.colorCount && p.colorCount > 1 && (
                          <p className="mt-1 text-[11px] font-semibold text-emerald">
                            {p.colorCount} colors available
                          </p>
                        )
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-display font-bold text-ink text-[14px] md:text-base">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {p.oldPrice && (
                        <span className="text-ink/40 text-[12px] line-through">
                          ₹{p.oldPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button
                        onClick={() => addToCart({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          image_url: p.image_url,
                          category_name: catName
                        })}
                        className="w-full text-center rounded-lg border border-emerald/50 text-emerald text-[13px] md:text-sm font-bold py-2.5 hover:bg-emerald hover:border-emerald hover:text-cream transition-colors flex items-center justify-center"
                      >
                        Add to cart
                      </button>
                      <button
                        onClick={() => {
                          addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image_url: p.image_url,
                            category_name: catName
                          });
                          router.push('/checkout');
                        }}
                        className="w-full text-center rounded-lg bg-emerald text-cream text-[13px] md:text-sm font-bold py-2.5 hover:bg-emerald-deep transition-colors flex items-center justify-center shadow-sm"
                      >
                        Buy now
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
