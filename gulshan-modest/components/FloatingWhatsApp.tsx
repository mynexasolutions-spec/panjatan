import { getStorefrontShell } from '@/lib/cms'
import FloatingWhatsAppClient from './FloatingWhatsAppClient'

export default async function FloatingWhatsApp() {
  const { settings } = await getStorefrontShell()
  return <FloatingWhatsAppClient settings={settings} />
}
