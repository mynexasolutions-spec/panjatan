// DEPRECATED — no longer used.
//
// This lightweight "verify email without creating an account" flow has been
// superseded by the real login system: app/checkout/_components/CheckoutForm.tsx
// now calls sendEmailOtp/verifyEmailOtp from actions/auth.ts directly, which
// verifies the email AND logs the shopper in (real account + session cookie)
// in one step. actions/checkout.ts's processCheckout() now gates on that
// real session via lib/customer-session.ts instead of a one-off marker here.
//
// Kept as an empty module (rather than deleted) because this sandbox can't
// remove files from the mounted project folder. Safe to delete by hand.
export {}
