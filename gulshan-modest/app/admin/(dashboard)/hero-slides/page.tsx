import { getHeroSlides } from '@/actions/admin/hero'
import { HeroSlideList } from './_components/HeroSlideList'

export const metadata = {
  title: 'Hero Slides | Admin Dashboard',
}

export default async function AdminHeroSlidesPage() {
  const slides = await getHeroSlides()

  const leftSlides = slides.filter(s => s.position === 'left')
  const rightSlides = slides.filter(s => !s.position || s.position === 'right')

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hero Section</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage the sliding background images for the storefront homepage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left and Right Slides */}
        <div className="xl:col-span-6">
          <HeroSlideList 
            initialSlides={leftSlides} 
            position="left"
            title="Left Area Images"
          />
        </div>
        <div className="xl:col-span-6">
          <HeroSlideList 
            initialSlides={rightSlides} 
            position="right"
            title="Right Area Images"
          />
        </div>

      </div>
    </div>
  )
}
