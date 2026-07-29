'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ADDRESS_STORAGE_KEY,
  CUSTOMER_CHANGED_EVENT,
  CUSTOMER_STORAGE_KEY,
  LEGACY_PROFILE_STORAGE_KEY,
  LocalAddress,
  LocalCustomer,
  LocalOrder,
  ORDER_STORAGE_KEY,
  isValidCustomerName,
  isValidIndianPhone,
  normalizeIndianPhone,
} from '@/lib/local-customer'
import { getGuestOrderStatuses } from '@/actions/checkout'
import { registerDemoCustomer } from '@/actions/customer'

type AddressBook = Record<string, LocalAddress>

type CustomerContextValue = {
  customer: LocalCustomer | null
  address: LocalAddress | null
  orders: LocalOrder[]
  isHydrated: boolean
  login: (fullName: string, phone: string) => Promise<void>
  logout: () => void
  saveAddress: (address: LocalAddress) => void
  addOrder: (order: LocalOrder) => void
  syncOrders: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined)

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<LocalCustomer | null>(null)
  const [addressBook, setAddressBook] = useState<AddressBook>({})
  const [allOrders, setAllOrders] = useState<LocalOrder[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const savedCustomer = readJson<LocalCustomer | null>(CUSTOMER_STORAGE_KEY, null)
    const savedAddresses = readJson<AddressBook>(ADDRESS_STORAGE_KEY, {})
    const savedOrders = readJson<LocalOrder[]>(ORDER_STORAGE_KEY, [])

    setCustomer(savedCustomer)
    setAddressBook(savedAddresses)
    setAllOrders(savedOrders)
    setIsHydrated(true)
    if (savedCustomer) {
      void registerDemoCustomer(savedCustomer.fullName, savedCustomer.phone)
    }
  }, [])

  const login = useCallback(async (fullName: string, phoneInput: string) => {
    const phone = normalizeIndianPhone(phoneInput)
    const name = fullName.trim().replace(/\s+/g, ' ')
    if (!isValidCustomerName(name) || !isValidIndianPhone(phone)) {
      throw new Error('Please enter a valid full name and Indian mobile number.')
    }

    const next = { fullName: name, phone }
    setCustomer(next)
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(next))

    const legacy = readJson<Partial<LocalAddress>>(LEGACY_PROFILE_STORAGE_KEY, {})
    if (!addressBook[phone] && legacy.phone && normalizeIndianPhone(legacy.phone) === phone) {
      const migrated: LocalAddress = {
        fullName: legacy.fullName || name,
        phone,
        alternatePhone: legacy.alternatePhone || '',
        street: legacy.street || '',
        city: legacy.city || '',
        state: legacy.state || '',
        zipCode: legacy.zipCode || '',
      }
      const nextBook = { ...addressBook, [phone]: migrated }
      setAddressBook(nextBook)
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(nextBook))
    }
    window.dispatchEvent(new Event(CUSTOMER_CHANGED_EVENT))
    await registerDemoCustomer(name, phone)
  }, [addressBook])

  const logout = useCallback(() => {
    setCustomer(null)
    localStorage.removeItem(CUSTOMER_STORAGE_KEY)
    window.dispatchEvent(new Event(CUSTOMER_CHANGED_EVENT))
  }, [])

  const saveAddress = useCallback((nextAddress: LocalAddress) => {
    if (!customer) throw new Error('Please log in before saving an address.')
    const normalized = {
      ...nextAddress,
      fullName: nextAddress.fullName.trim(),
      phone: customer.phone,
    }
    setAddressBook((current) => {
      const next = { ...current, [customer.phone]: normalized }
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [customer])

  const addOrder = useCallback((order: LocalOrder) => {
    setAllOrders((current) => {
      const existingIndex = current.findIndex(
        (entry) => entry.id === order.id || entry.orderNumber === order.orderNumber
      )
      const next = existingIndex >= 0
        ? current.map((entry, index) => index === existingIndex ? order : entry)
        : [order, ...current]
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const syncOrders = useCallback(async () => {
    if (!customer) return
    const known = allOrders.filter((order) => order.customerPhone === customer.phone)
    if (known.length === 0) return
    const result = await getGuestOrderStatuses(
      customer.phone,
      known.map((order) => order.orderNumber)
    )
    if (!result.success || result.orders.length === 0) return
    const updates = new Map(result.orders.map((order) => [order.orderNumber, order]))
    setAllOrders((current) => {
      const next = current.map((order) => {
        const update = updates.get(order.orderNumber)
        return update ? { ...order, status: update.status, paymentStatus: update.paymentStatus } : order
      })
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [allOrders, customer])

  const address = customer ? addressBook[customer.phone] || null : null
  const orders = useMemo(
    () => customer
      ? allOrders.filter((order) => order.customerPhone === customer.phone)
      : [],
    [allOrders, customer]
  )

  return (
    <CustomerContext.Provider value={{
      customer,
      address,
      orders,
      isHydrated,
      login,
      logout,
      saveAddress,
      addOrder,
      syncOrders,
    }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const value = useContext(CustomerContext)
  if (!value) throw new Error('useCustomer must be used within CustomerProvider')
  return value
}
