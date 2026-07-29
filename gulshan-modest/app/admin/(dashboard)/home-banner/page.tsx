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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Home Banner</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage the auto-swiping banner shown on the homepage, just above "Shop by Category".
        </p>
      </div>

      <HomeBannerManager initialEnabled={enabled} initialImages={images} />
    </div>
  )
}
