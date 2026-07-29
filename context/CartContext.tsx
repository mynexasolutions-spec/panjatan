'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
import { useToast } from '@/context/ToastContext'

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
  addToCart: (item: Omit<CartItem, 'quantity' | 'cartItemId'>, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  isHydrated: boolean
  isSyncing: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const cartRef = useRef<CartItem[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    cartRef.current = cart
  }, [cart])

  useEffect(() => {
    const savedCart = localStorage.getItem('gulshan-cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCart(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Failed to load cart', error)
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('gulshan-cart', JSON.stringify(cart))
  }, [cart, hydrated])

  const addToCart = (
    item: Omit<CartItem, 'quantity' | 'cartItemId'>,
    quantity: number = 1
  ) => {
    const safeQuantity = Math.max(1, Math.floor(quantity))
    const cartItemId = `${item.id}-${item.variant_id || 'default'}`
    setCart((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId)
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === existing.cartItemId
            ? { ...i, quantity: i.quantity + safeQuantity }
            : i
        )
      }
      return [...prev, { ...item, cartItemId, quantity: safeQuantity }]
    })

    showToast('Item has been added to cart', 'success')
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
        isHydrated: hydrated,
        isSyncing: false,
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
