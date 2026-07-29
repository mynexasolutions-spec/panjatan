'use client'

import { useState } from 'react'
import { Search, UserX, UserCheck, Mail, Phone, Calendar } from 'lucide-react'
import { toggleCustomerStatus } from '@/actions/admin/customers'
import type { Profile } from '@/types/database'

interface CustomerListProps {
  initialCustomers: Profile[]
}

export default function CustomerList({ initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  )

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(id)
    try {
      const result = await toggleCustomerStatus(id, !currentStatus)
      if (result.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, is_active: !currentStatus } : c
          )
        )
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error(error)
      alert('An unexpected error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers by name, email, or phone..."
          className="block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-xl leading-5 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-orange-100 to-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-stone-900">
                            {customer.full_name}
                          </div>
                          <div className="text-sm text-stone-500 font-mono text-xs">
                            ID: {customer.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-900 flex items-center gap-2 mb-1">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-stone-500 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {customer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.is_active
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {customer.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(customer.id, customer.is_active)}
                        disabled={isLoading === customer.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          customer.is_active
                            ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                            : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoading === customer.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : customer.is_active ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                        {customer.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center">
                      <UserX className="w-12 h-12 text-stone-300 mb-3" />
                      <p className="text-lg font-medium text-stone-900">No customers found</p>
                      <p className="text-sm">We couldn't find any customers matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
