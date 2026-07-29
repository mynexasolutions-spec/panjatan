'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CartItem = {
  cartItemId: string
  id: string
  name: string
  price: number
  image_url: string
  quantity: number
  category_name?: string
  variant_id?: string
  variant_name?: string
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('gulshan-cart')
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (e) {
          console.error('Failed to load cart', e)
        }
      }
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gulshan-cart', JSON.stringify(cart))
    }
  }, [cart])

  const addToCart = (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => {
    const cartItemId = `${item.id}-${item.variant_id || 'default'}`
    setCart((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId)
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, cartItemId, quantity: 1 }]
    })
  }

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setCart((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
