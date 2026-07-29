import { getStorefrontShell } from '@/lib/cms'
import HeaderClient from './HeaderClient'

export default async function Header() {
  const shell = await getStorefrontShell()
  return <HeaderClient settings={shell.settings} navLinks={shell.headerLinks} />
}
