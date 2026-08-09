import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SignupForm from './_components/SignupForm'
import { sanitizeReturnTo } from '@/lib/local-customer'

export const metadata = {
  title: 'Sign Up | Panjatan Ayurveda',
  description: 'Create your account with a verified email address.',
}

export default async function SignupPage({
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
            <h1 className="font-heading text-3xl font-bold text-ink">Create Account</h1>
            <p className="text-ink/70 mt-2 font-body">
              Sign up with your name, mobile number, and a verified email address.
            </p>
          </div>
          <SignupForm returnTo={returnTo} />
        </div>
      </main>
      <Footer />
    </>
  )
}
