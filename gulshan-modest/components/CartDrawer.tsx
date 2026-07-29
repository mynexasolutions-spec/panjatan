'use client'

import React from 'react'
import { useCart } from '@/context/CartContext'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
  shipping?: any
}

export default function CartDrawer({ isOpen, onClose, shipping }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()
  
  const flatRate = shipping?.flat_rate ?? 99
  const freeThreshold = shipping?.free_threshold ?? 1999
  const codCharge = shipping?.cod_charge ?? 49
  const onlineDiscount = shipping?.online_discount ?? 5

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100000] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Drawer Content */}
        <div className="w-screen max-w-md bg-white flex flex-col shadow-2xl border-l border-cream-line animate-slide-left">
          {/* Header */}
          <div className="h-16 border-b border-cream-line px-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-emerald">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-display font-semibold text-lg">My Cart ({cartCount})</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-ink/40 hover:text-ink transition-colors rounded-lg hover:bg-cream"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto py-5 px-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-ink/30">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <p className="text-ink font-medium text-[15px]">Your cart is empty</p>
                <p className="text-ink/50 text-xs max-w-[240px]">
                  Explore our collection and add your favourite pieces to your bag.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-xs font-semibold px-4 py-2 border-2 border-emerald text-emerald hover:bg-emerald hover:text-cream rounded-full transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 p-3 rounded-xl border border-cream-line bg-cream/10">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border border-cream-line/50">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-semibold text-ink text-sm leading-tight line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-ink/40 uppercase tracking-wider font-semibold mt-0.5">
                        {item.category_name} {item.variant_name && `• Size: ${item.variant_name}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-cream-line bg-white rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 hover:text-emerald transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 hover:text-emerald transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-emerald text-sm">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-ink/30 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer actions */}
          {cart.length > 0 && (
            <div className="border-t border-cream-line p-5 space-y-4 shrink-0 bg-cream/10">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-ink/60 font-medium">Subtotal</span>
                <span className="font-display font-bold text-xl text-emerald">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-ink/40 leading-relaxed">
                Shipping is ₹{flatRate} or FREE above ₹{freeThreshold.toLocaleString('en-IN')}. 
                {codCharge > 0 && ` COD charge: ₹${codCharge}.`}
                {onlineDiscount > 0 && ` Get ${onlineDiscount}% OFF on Online Payments.`}
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full text-center py-3.5 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-colors flex items-center justify-center gap-1.5"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-center py-2.5 text-xs text-ink/50 hover:text-emerald font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
