import { getShippingSettings } from '@/actions/admin/shipping'
import { getCoupons } from '@/actions/admin/coupons'
import { isRazorpayEnabled } from '@/actions/checkout'
import { getStorefrontShell } from '@/lib/cms'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutForm from './_components/CheckoutForm'

export const metadata = {
  title: 'Secure Checkout | Panjatan Ayurveda',
}

export default async function CheckoutPage() {
  const [shipping, coupons, razorpayEnabled, shell] = await Promise.all([
    getShippingSettings(),
    getCoupons(),
    isRazorpayEnabled(),
    getStorefrontShell(),
  ])
  const hasCoupons = coupons.some(c => c.is_active)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">
          <CheckoutForm
            shipping={shipping}
            hasCoupons={hasCoupons}
            razorpayEnabled={razorpayEnabled}
            whatsappNumber={shell.settings.whatsapp_number}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
