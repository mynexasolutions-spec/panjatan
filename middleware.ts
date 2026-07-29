import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from '@/lib/admin-jwt'
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerToken,
} from '@/lib/customer-jwt'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const customerSession = await verifyCustomerToken(
    request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
  )

  let supabaseUser = null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })
    const { data } = await supabase.auth.getUser()
    supabaseUser = data.user
  }

  const pathname = request.nextUrl.pathname
  const isProtectedPath = pathname.startsWith('/account')
  const isAdminPath =
    pathname.startsWith('/admin') && pathname !== '/admin/login'

  if (isAdminPath) {
    const adminSession = await verifyAdminToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    )
    if (!adminSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  if (isProtectedPath && !customerSession && !supabaseUser) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
