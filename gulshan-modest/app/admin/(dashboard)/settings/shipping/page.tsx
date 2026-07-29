import { getShippingSettings } from '@/actions/admin/shipping'
import ShippingForm from './_components/ShippingForm'

export const metadata = {
  title: 'Shipping Settings | Admin Dashboard',
}

export default async function ShippingSettingsPage() {
  const shipping = await getShippingSettings()

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Shipping Settings</h1>
        <p className="mt-1 text-sm text-stone-500">
          Manage flat shipping rates and free shipping order thresholds.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
        <ShippingForm initialShipping={shipping} />
      </div>
    </div>
  )
}
