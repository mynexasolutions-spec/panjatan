import { getCoupons } from '@/actions/admin/coupons'
import CouponsList from './_components/CouponsList'
import CouponForm from './_components/CouponForm'

export const metadata = {
  title: 'Manage Coupons | Admin Dashboard',
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Checkout Coupons</h1>
        <p className="mt-1 text-sm text-stone-500">
          Create, toggle and manage discount coupons for customer checkouts.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Create Coupon */}
        <div className="xl:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
              Create New Coupon
            </h3>
            <CouponForm />
          </div>
        </div>

        {/* Right Column: List Coupons */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                Active Coupons
              </h3>
            </div>
            <CouponsList initialCoupons={coupons} />
          </div>
        </div>
      </div>
    </div>
  )
}
