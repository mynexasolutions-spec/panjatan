import { getStorefrontShell } from '@/lib/cms'
import FooterClient from './FooterClient'

export default async function Footer() {
  const shell = await getStorefrontShell()
  return <FooterClient settings={shell.settings} footerLinks={shell.footerLinks} legalLinks={shell.legalLinks} />
}
