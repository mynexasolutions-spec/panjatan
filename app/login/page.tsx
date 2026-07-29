import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthForm from './_components/AuthForm'
import { sanitizeReturnTo } from '@/lib/local-customer'

export const metadata = {
  title: 'Login | Panjatan Ayurveda',
  description: 'Demo customer login with your name and Indian mobile number.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; redirect?: string }>
}) {
  const params = await searchParams
  const returnTo = sanitizeReturnTo(params.returnTo || params.redirect)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream flex flex-col justify-center py-20 px-5">
        <div className="max-w-md w-full mx-auto bg-cream-deep p-8 rounded-3xl border border-gold/20 shadow-soft">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-ink">Customer Login</h1>
            <p className="text-ink/70 mt-2 font-body">
              Enter your name and mobile number to continue on this device.
            </p>
          </div>
          <AuthForm returnTo={returnTo} />
        </div>
      </main>
      <Footer />
    </>
  )
}
