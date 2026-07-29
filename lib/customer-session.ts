import { cookies } from 'next/headers'
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  createCustomerToken,
  verifyCustomerToken,
} from '@/lib/customer-jwt'

export async function getCustomerSession() {
  const store = await cookies()
  return verifyCustomerToken(store.get(CUSTOMER_SESSION_COOKIE)?.value)
}

export async function setCustomerSession(input: {
  id: string
  email: string
  full_name?: string | null
}) {
  const store = await cookies()
  store.set(CUSTOMER_SESSION_COOKIE, await createCustomerToken(input), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CUSTOMER_SESSION_MAX_AGE,
  })
}

export async function clearCustomerSession() {
  const store = await cookies()
  store.set(CUSTOMER_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  })
}

export function devMocksEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_MOCKS === 'true'
}
