import { getAnnouncement } from '@/actions/admin/announcements'
import { AnnouncementForm } from './_components/AnnouncementForm'

export const metadata = {
  title: 'Announcements | Admin Dashboard',
}

export default async function AdminAnnouncementsPage() {
  const announcement = await getAnnouncement()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Announcement Banner</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage the global announcement banner that appears at the very top of the storefront.
        </p>
      </div>

      <AnnouncementForm 
        initialMessage={announcement?.message || ''} 
        initialIsActive={announcement?.is_active || false} 
      />
    </div>
  )
}
