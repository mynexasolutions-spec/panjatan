import { getShippingSettings } from '@/actions/admin/shipping'
import { getCoupons } from '@/actions/admin/coupons'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutForm from './_components/CheckoutForm'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Secure Checkout | Gulshan Modest',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const shipping = await getShippingSettings()
  const coupons = await getCoupons()
  const hasCoupons = coupons.some(c => c.is_active)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">
          <CheckoutForm shipping={shipping} isLoggedIn={!!user} hasCoupons={hasCoupons} />
        </div>
      </main>
      <Footer />
    </>
  )
}
