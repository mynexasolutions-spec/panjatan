import { getCustomers } from '@/actions/admin/customers'
import CustomerList from './_components/CustomerList'

export const metadata = {
  title: 'Customers | Admin Dashboard',
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  // Calculate simple stats
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.is_active).length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Customers</h1>
        <p className="mt-1 text-sm text-stone-500">
          Manage your registered customers and their account status.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">Total Customers</p>
            <p className="text-3xl font-bold text-stone-900 mt-1">{totalCustomers}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">Active Accounts</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{activeCustomers}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>
      </div>

      {/* List */}
      <CustomerList initialCustomers={customers} />
    </div>
  )
}
