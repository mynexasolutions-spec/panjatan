import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { AdminSidebarProvider } from '@/context/AdminSidebarContext'
import { getAdminSession } from '@/lib/admin-session'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <AdminSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AdminSidebarProvider>
  )
}
