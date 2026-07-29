import { getInquiries } from '@/actions/admin/inquiries'
import { InquiriesList } from './_components/InquiriesList'

export const metadata = {
  title: 'Contact Inquiries | Admin Dashboard',
}

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries()
  const unreadCount = inquiries.filter(i => i.status === 'unread').length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            Contact Inquiries
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage messages sent from the storefront contact page.
          </p>
        </div>
      </div>

      <InquiriesList initialInquiries={inquiries} />
    </div>
  )
}
