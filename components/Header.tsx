import { getStorefrontShell, getActiveAnnouncement } from '@/lib/cms'
import HeaderClient from './HeaderClient'

export default async function Header() {
  const [shell, announcement] = await Promise.all([
    getStorefrontShell(),
    getActiveAnnouncement().catch(() => null),
  ])
  return (
    <HeaderClient
      settings={shell.settings}
      navLinks={shell.headerLinks}
      announcementText={announcement?.is_active ? announcement.message : null}
    />
  )
}
