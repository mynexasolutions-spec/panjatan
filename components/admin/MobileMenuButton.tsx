'use client'

import { Menu } from 'lucide-react'
import { useAdminSidebar } from '@/context/AdminSidebarContext'

export default function MobileMenuButton() {
  const { setMobileOpen } = useAdminSidebar()

  return (
    <button
      onClick={() => setMobileOpen(true)}
      className="md:hidden p-2 -ml-2 rounded-lg text-stone-500 hover:text-teal-800 hover:bg-stone-100 transition-colors"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}
