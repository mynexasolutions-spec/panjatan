import { LogOut, User } from 'lucide-react'
import { adminLogout } from '@/actions/auth'
import MobileMenuButton from '@/components/admin/MobileMenuButton'
import { getAdminSession } from '@/lib/admin-session'

export default async function AdminHeader() {
  const session = await getAdminSession()

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-3 sm:px-6 shrink-0 gap-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <MobileMenuButton />
        <h2 className="text-base sm:text-lg font-semibold text-stone-900 truncate">
          Admin Dashboard
        </h2>
        <a
          href="/"
          className="hidden sm:flex text-xs font-semibold text-teal-800 hover:text-teal-900 border border-teal-700/20 hover:border-teal-700/50 bg-teal-50/50 hover:bg-teal-50 px-3.5 py-1 rounded-full transition-all items-center gap-1 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </a>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Admin info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-stone-500" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-stone-700 leading-tight">
              {session?.email || 'Admin'}
            </p>
            <p className="text-xs text-stone-400">Administrator</p>
          </div>
        </div>

        {/* Logout */}
        <form action={adminLogout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  )
}
