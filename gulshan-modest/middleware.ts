import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from '@/lib/admin-jwt'

export async function middleware(request: NextRequest) {
  const hasMockCookie = request.cookies.get('mock-admin-logged-in')?.value === 'true'
  const hasCustomCookie = request.cookies.get('gulshan-user-session')?.value
  
  // Check if any supabase auth cookie exists (standard naming format is sb-<project-id>-auth-token)
  const hasSupabaseCookie = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )

  const customerLoggedIn = hasMockCookie || hasSupabaseCookie || !!hasCustomCookie

  // Protected paths
  // Note: /checkout is intentionally not gated here — it collects the
  // address and creates/logs the account inline as part of the form.
  const isProtectedPath = request.nextUrl.pathname.startsWith('/account')
  const isAdminPath =
    request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/admin/login'

  if (isAdminPath) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    const adminSession = await verifyAdminToken(adminToken)

    if (!adminSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  if (isProtectedPath && !customerLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
