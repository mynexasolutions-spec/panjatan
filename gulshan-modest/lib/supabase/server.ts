import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

const getDbPath = () => path.join(process.cwd(), 'lib', 'db.json')

const readDb = () => {
  try {
    const data = fs.readFileSync(getDbPath(), 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return {}
  }
}

const writeDb = (data: any) => {
  try {
    fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2), 'utf8')
  } catch (e) {
    console.error('Failed to write mock db:', e)
  }
}

class MockQueryBuilder {
  private tableName: string
  private filters: Array<{ field: string; val: any }> = []
  private isSingle = false
  private isDelete = false
  private isInsert = false
  private isUpdate = false
  private insertData: any = null
  private updateData: any = null
  private sortField = ''
  private sortAsc = true

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
  order(field: string, opts?: { ascending?: boolean }) {
    this.sortField = field
    this.sortAsc = opts?.ascending !== false
    return this
  }
  limit(n: number) {
    return this
  }
  delete() {
    this.isDelete = true
    return this
  }
  insert(data: any) {
    this.isInsert = true
    this.insertData = data
    return this
  }
  update(data: any) {
    this.isUpdate = true
    this.updateData = data
    return this
  }

  async execute() {
    const db = readDb()
    if (this.tableName === 'settings') {
      if (this.isUpdate) {
        db.settings = { ...db.settings, ...this.updateData }
        writeDb(db)
        return { data: db.settings, error: null }
      }
      if (this.isSingle) {
        return { data: db.settings || {}, error: null }
      }
      return { data: [db.settings || {}], count: 1, error: null }
    }

    let table = db[this.tableName] || []

    if (!Array.isArray(table)) {
      table = [table]
    }

    if (this.isInsert) {
      const dataToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
      dataToInsert.forEach((item: any) => {
        if (!item.id) {
          item.id = Math.random().toString(36).substring(2, 9)
        }
        item.created_at = new Date().toISOString()
        table.push(item)
      })
      db[this.tableName] = table
      writeDb(db)
      return { data: this.insertData, error: null }
    }

    if (this.isUpdate) {
      table = table.map((item: any) => {
        const matches = this.filters.every(f => item[f.field] === f.val)
        if (matches) {
          return { ...item, ...this.updateData }
        }
        return item
      })
      db[this.tableName] = table
      writeDb(db)
      return { data: this.updateData, error: null }
    }

    if (this.isDelete) {
      table = table.filter((item: any) => {
        const matches = this.filters.every(f => item[f.field] === f.val)
        return !matches
      })
      db[this.tableName] = table
      writeDb(db)
      return { data: null, error: null }
    }

    let filtered = [...table]
    this.filters.forEach(f => {
      filtered = filtered.filter(item => item[f.field] === f.val)
    })

    if (this.sortField) {
      filtered.sort((a, b) => {
        const valA = a[this.sortField]
        const valB = b[this.sortField]
        if (valA < valB) return this.sortAsc ? -1 : 1
        if (valA > valB) return this.sortAsc ? 1 : -1
        return 0
      })
    }

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

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookieStore = await cookies()

  const customSessionVal = cookieStore.get('gulshan-user-session')?.value
  let customSession: any = null
  if (customSessionVal) {
    try {
      // Next.js URL-encodes cookie values; decode before parsing
      const decoded = decodeURIComponent(customSessionVal)
      customSession = JSON.parse(decoded)
    } catch (e) { }
  }

  const getCustomAuth = (realAuth: any = null) => ({
    getUser: async () => {
      if (customSession) {
        return { data: { user: { id: customSession.id, email: customSession.email, user_metadata: { full_name: customSession.full_name, role: customSession.role } } }, error: null }
      }
      const hasMockCookie = cookieStore.get('mock-admin-logged-in')?.value === 'true'
      if (hasMockCookie) {
        return { data: { user: { id: 'mock-admin-id', email: 'admin@gulshanmodest.com', user_metadata: { role: 'admin' } } }, error: null }
      }
      if (realAuth) return await realAuth.getUser()
      return { data: { user: null }, error: null }
    },
    getSession: async () => {
      if (customSession) {
        return { data: { session: { user: { id: customSession.id, email: customSession.email, user_metadata: { full_name: customSession.full_name, role: customSession.role } } } }, error: null }
      }
      const hasMockCookie = cookieStore.get('mock-admin-logged-in')?.value === 'true'
      if (hasMockCookie) {
        return { data: { session: { user: { id: 'mock-admin-id', email: 'admin@gulshanmodest.com', user_metadata: { role: 'admin' } } } }, error: null }
      }
      if (realAuth) return await realAuth.getSession()
      return { data: { session: null }, error: null }
    },
    signInWithPassword: async (credentials: any) => {
      if (realAuth) return await realAuth.signInWithPassword(credentials)
      if (credentials?.email?.includes('admin')) {
        cookieStore.set('mock-admin-logged-in', 'true', { path: '/' })
        return { data: { user: { id: 'mock-admin-id', email: credentials.email } }, error: null }
      }
      return { data: null, error: { message: 'Mock signin only works for admin' } }
    },
    signOut: async () => {
      cookieStore.set('gulshan-user-session', '', { path: '/', expires: new Date(0) })
      cookieStore.set('mock-admin-logged-in', '', { path: '/', expires: new Date(0) })
      if (realAuth) await realAuth.signOut()
      return { error: null }
    }
  })

  if (!url || !key || url.includes('placeholder') || url === '') {
    // Server-side mock client to avoid crash and support local mock session
    return {
      auth: getCustomAuth(),
      from: (table: string) => new MockQueryBuilder(table)
    } as any
  }

  const client = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          // Exclude our custom session cookie so Supabase SSR does not try to parse it
          return cookieStore.getAll().filter(c => c.name !== 'gulshan-user-session')
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

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
