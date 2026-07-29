import { requireAdminClient } from '@/lib/supabase/admin'
import { ReviewList } from './_components/ReviewList'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Reviews Management | Admin',
}

export default async function AdminReviewsPage() {
  const supabase = await requireAdminClient()
  if (!supabase) redirect('/admin/login')

  // Fetch all reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      products ( name ),
      profiles ( full_name, email )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Product Reviews</h1>
          <p className="text-stone-500 text-sm mt-1">Manage and moderate customer reviews before they appear on the site.</p>
        </div>
      </div>

      <ReviewList initialReviews={reviews || []} />
    </div>
  )
}
