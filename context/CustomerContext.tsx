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
  LocalAddress,
  LocalCustomer,
  LocalOrder,
  ORDER_STORAGE_KEY,
} from '@/lib/local-customer'
import { getMyOrders } from '@/actions/checkout'
import { getSessionCustomer, logoutCustomer } from '@/actions/auth'

type AddressBook = Record<string, LocalAddress>

type CustomerContextValue = {
  customer: LocalCustomer | null
  address: LocalAddress | null
  orders: LocalOrder[]
  isHydrated: boolean
  refreshCustomer: (localData?: LocalCustomer | null) => Promise<LocalCustomer | null>
  logout: () => Promise<void>
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

  // Real, server-verified identity (httpOnly session cookie). This is the
  // source of truth for "who is logged in" — the address book stays in
  // localStorage, keyed by phone, but order history is fetched fresh from
  // the database (see syncOrdersFor) so it isn't limited to one device.
  const refreshCustomer = useCallback(async (localData?: LocalCustomer | null) => {
    if (localData !== undefined) {
      setCustomer(localData)
      window.dispatchEvent(new Event(CUSTOMER_CHANGED_EVENT))
      return localData
    }
    const session = await getSessionCustomer()
    const next: LocalCustomer | null = session
      ? { id: session.id, fullName: session.fullName, phone: session.phone, email: session.email }
      : null
    setCustomer(next)
    window.dispatchEvent(new Event(CUSTOMER_CHANGED_EVENT))
    return next
  }, [])

  // Fetches order history for a specific customer from the database and
  // writes it into localStorage as a cache. Takes the customer explicitly
  // (rather than reading it from state) so it can be called immediately
  // after login, before CustomerProvider has necessarily re-rendered with
  // the new value yet.
  const syncOrdersFor = useCallback(async (forCustomer: LocalCustomer) => {
    const result = await getMyOrders()
    if (!result.success) return
    const email = forCustomer.email.toLowerCase()
    setAllOrders((current) => {
      const others = current.filter(
        (order) => (order.shippingAddress?.email || '').toLowerCase() !== email
      )
      const next = [...result.orders, ...others]
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  useEffect(() => {
    const savedAddresses = readJson<AddressBook>(ADDRESS_STORAGE_KEY, {})
    const savedOrders = readJson<LocalOrder[]>(ORDER_STORAGE_KEY, [])
    setAddressBook(savedAddresses)
    setAllOrders(savedOrders)

    void refreshCustomer()
      .then((next) => (next ? syncOrdersFor(next) : undefined))
      .finally(() => setIsHydrated(true))
  }, [refreshCustomer, syncOrdersFor])

  const logout = useCallback(async () => {
    await logoutCustomer()
    setCustomer(null)
    window.dispatchEvent(new Event(CUSTOMER_CHANGED_EVENT))
  }, [])

  // Keyed by email (the account's fixed identity), not phone — the
  // shipping "phone" on an address is allowed to differ from the account's
  // own phone (e.g. ordering for someone else), so phone can't double as a
  // lookup key. Reads nextAddress.email directly (not context `customer`
  // state) so this is safe to call immediately after login — right after
  // verifyEmailOtp succeeds, `customer` in this closure can still be stale
  // for one tick until CustomerProvider re-renders.
  const saveAddress = useCallback((nextAddress: LocalAddress) => {
    const email = (nextAddress.email || '').trim().toLowerCase()
    if (!email) throw new Error('An account email is required to save an address.')
    const normalized = { ...nextAddress, fullName: nextAddress.fullName.trim(), email }
    setAddressBook((current) => {
      const next = { ...current, [email]: normalized }
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

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
    await syncOrdersFor(customer)
  }, [customer, syncOrdersFor])

  const address = customer ? addressBook[customer.email.toLowerCase()] || null : null
  const orders = useMemo(() => {
    if (!customer) return []
    const email = customer.email.toLowerCase()
    return allOrders.filter(
      (order) => (order.shippingAddress?.email || '').toLowerCase() === email
    )
  }, [allOrders, customer])

  return (
    <CustomerContext.Provider value={{
      customer,
      address,
      orders,
      isHydrated,
      refreshCustomer,
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
