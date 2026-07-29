import { createBrowserClient } from '@supabase/ssr'
import dbData from '../db.json'

class MockQueryBuilder {
  constructor(private tableName: string) {}
  private filters: Array<{ field: string; val: unknown }> = []
  private isSingle = false
  select() { return this }
  eq(field: string, val: unknown) { this.filters.push({ field, val }); return this }
  single() { this.isSingle = true; return this }
  order() { return this }
  limit() { return this }
  async execute() {
    const source = (dbData as Record<string, unknown>)[this.tableName]
    const table = Array.isArray(source) ? source : []
    const rows = table.filter((item) =>
      this.filters.every((filter) =>
        (item as Record<string, unknown>)[filter.field] === filter.val
      )
    )
    return {
      data: this.isSingle ? rows[0] || null : rows,
      count: rows.length,
      error: null,
    }
  }
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected)
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('placeholder')) {
    const allowMocks =
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_ENABLE_DEV_MOCKS === 'true'
    if (!allowMocks) {
      throw new Error(
        'Supabase is not configured and NEXT_PUBLIC_ENABLE_DEV_MOCKS is not true'
      )
    }
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (callback: (event: string, session: null) => void) => {
          callback('SIGNED_OUT', null)
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
      },
      from: (table: string) => new MockQueryBuilder(table),
    } as any
  }

  // The signed customer session is httpOnly and deliberately invisible here.
  // Browser identity comes only from Supabase's verified browser session.
  return createBrowserClient(url, key)
}
