import { cookies } from 'next/headers'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminToken,
  verifyAdminToken,
} from '@/lib/admin-jwt'

export async function getAdminSession() {
  const cookieStore = await cookies()
  return verifyAdminToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function isAdminAuthenticated() {
  return !!(await getAdminSession())
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies()
  const token = await createAdminToken(email)

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  })
}
