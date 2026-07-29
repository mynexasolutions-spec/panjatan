import { createBrowserClient } from '@supabase/ssr'
import dbData from '../db.json'

class MockQueryBuilder {
  private tableName: string
  private filters: Array<{ field: string; val: any }> = []
  private isSingle = false

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select() { return this }
  eq(field: string, val: any) {
    this.filters.push({ field, val })
    return this
  }
  single() {
    this.isSingle = true
    return this
  }
  order() { return this }
  limit() { return this }

  async execute() {
    const db: any = dbData
    const table = db[this.tableName] || []

    let filtered = [...table]
    this.filters.forEach(f => {
      filtered = filtered.filter(item => item[f.field] === f.val)
    })

    if (this.isSingle) {
      if (this.tableName === 'profiles' && filtered.length === 0 && this.filters.some(f => f.field === 'id' && f.val === 'mock-admin-id')) {
        return { data: { role: 'admin' }, error: null }
      }
      return { data: filtered[0] || null, error: null }
    }

    return { data: filtered, count: filtered.length, error: null }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected)
  }

  catch(onrejected?: (reason: any) => any) {
    return this.execute().catch(onrejected)
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const getCookie = (name: string) => {
    if (typeof window === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const val = parts.pop()?.split(';').shift()
      return val ? decodeURIComponent(val) : null
    }
    return null
  }

  const getCustomAuth = (realAuth: any = null) => {
    const getSessionData = () => {
      const customSessionVal = getCookie('gulshan-user-session')
      if (customSessionVal) {
        try {
          return JSON.parse(customSessionVal)
        } catch (e) { }
      }
      return null
    }

    return {
      getUser: async () => {
        const session = getSessionData()
        if (session) {
          return { data: { user: { id: session.id, email: session.email, user_metadata: { full_name: session.full_name, role: session.role } } }, error: null }
        }
        const mockCookie = getCookie('mock-admin-logged-in') === 'true'
        if (mockCookie) {
          return { data: { user: { id: 'mock-admin-id', email: 'admin@gulshanmodest.com', user_metadata: { role: 'admin' } } }, error: null }
        }
        if (realAuth) return await realAuth.getUser()
        return { data: { user: null }, error: null }
      },
      getSession: async () => {
        const session = getSessionData()
        if (session) {
          return { data: { session: { user: { id: session.id, email: session.email, user_metadata: { full_name: session.full_name, role: session.role } } } }, error: null }
        }
        const mockCookie = getCookie('mock-admin-logged-in') === 'true'
        if (mockCookie) {
          return { data: { session: { user: { id: 'mock-admin-id', email: 'admin@gulshanmodest.com', user_metadata: { role: 'admin' } } } }, error: null }
        }
        if (realAuth) return await realAuth.getSession()
        return { data: { session: null }, error: null }
      },
      signInWithPassword: async (credentials: any) => {
        if (realAuth) return await realAuth.signInWithPassword(credentials)
        if (credentials?.email?.includes('admin')) {
          if (typeof window !== 'undefined') {
            document.cookie = 'mock-admin-logged-in=true; path=/'
          }
          return { data: { user: { id: 'mock-admin-id', email: credentials.email } }, error: null }
        }
        return { data: null, error: { message: 'Mock signin only works for admin' } }
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'gulshan-user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'mock-admin-logged-in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
        if (realAuth) await realAuth.signOut()
        return { error: null }
      },
      onAuthStateChange: (callback: any) => {
        const session = getSessionData()
        if (session) {
          callback('SIGNED_IN', { user: { id: session.id, email: session.email } })
        } else {
          callback('SIGNED_OUT', null)
        }
        return { data: { subscription: { unsubscribe: () => { } } } }
      }
    }
  }

  if (!url || !key || url.includes('placeholder') || url === '') {
    // Mock client for local development without Supabase
    return {
      auth: getCustomAuth(),
      from: (table: string) => new MockQueryBuilder(table)
    } as any
  }

  const client = createBrowserClient(url, key)
  const originalAuth = client.auth

  Object.defineProperty(client, 'auth', {
    get() {
      return getCustomAuth(originalAuth)
    },
    configurable: true,
    enumerable: true
  })

  return client
}
