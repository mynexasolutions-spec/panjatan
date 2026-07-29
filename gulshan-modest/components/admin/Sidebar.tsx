'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  Image,
  Images,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Truck,
  Tag,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAdminSidebar } from '@/context/AdminSidebarContext'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Hero Slides', href: '/admin/hero-slides', icon: Image },
  { label: 'Home Banner', href: '/admin/home-banner', icon: Images },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Global FAQs', href: '/admin/settings/faqs', icon: Settings },
  { label: 'Shipping Settings', href: '/admin/settings/shipping', icon: Truck },
  { label: 'Manage Coupons', href: '/admin/settings/coupons', icon: Tag },
  { label: 'Manage Profile', href: '/admin/settings/profile', icon: User },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { mobileOpen, setMobileOpen } = useAdminSidebar()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`${
          collapsed ? 'md:w-[72px]' : 'md:w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#FBF7F0] border-r border-[#E6DAC4] flex flex-col shrink-0 transition-all duration-300 ease-in-out md:translate-x-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-4 border-b border-[#E6DAC4] gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-700 to-teal-800 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-teal-700/20">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-ink font-semibold text-sm leading-tight truncate">
                Gulshan Modest
              </p>
              <p className="text-ink/50 text-xs truncate">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-ink/50 hover:text-teal-800 hover:bg-cream-deep/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-teal-700/10 text-teal-800 font-semibold'
                    : 'text-ink/75 hover:text-teal-800 hover:bg-cream-deep/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-teal-800'
                      : 'text-ink/40 group-hover:text-teal-700'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="p-3 border-t border-[#E6DAC4] hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-ink/50 hover:text-teal-800 hover:bg-cream-deep/60 transition-all duration-200 text-sm"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
