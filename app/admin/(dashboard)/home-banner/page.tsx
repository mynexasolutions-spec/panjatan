import { getHomeBannerEnabled, getHomeBannerImages } from '@/actions/admin/homeBanner'
import { HomeBannerManager } from './_components/HomeBannerManager'

export const metadata = {
  title: 'Home Banner | Admin Dashboard',
}

export default async function AdminHomeBannerPage() {
  const [enabled, images] = await Promise.all([
    getHomeBannerEnabled(),
    getHomeBannerImages(),
  ])

  const desktopImages = images.filter((img) => (img.device_type || 'desktop') === 'desktop')
  const mobileImages = images.filter((img) => img.device_type === 'mobile')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Hero Banner</h1>
        <p className="text-sm text-stone-500 mt-1">
          This banner is now the homepage hero — it replaces the old text + image hero. Upload separate image sets for desktop/PC and mobile; each set auto-slides when it has more than one active image.
        </p>
      </div>

      <HomeBannerManager
        initialEnabled={enabled}
        initialDesktopImages={desktopImages}
        initialMobileImages={mobileImages}
      />
    </div>
  )
}
