import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Terms & Conditions | Gulshan Modest',
}

export default function TermsConditions() {
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-ink mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-emerald prose-sm md:prose-base text-ink/80 max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>
          
          <p>
            Welcome to Gulshan Modest. By accessing or using our website, you agree to be bound by these Terms and Conditions and our Privacy Policy.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">1. Online Store Terms</h3>
          <p>
            By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">2. Products or Services</h3>
          <p>
            Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy. We have made every effort to display as accurately as possible the colors and images of our products.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">3. Accuracy of Billing and Account Information</h3>
          <p>
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. 
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">4. Payment Terms</h3>
          <p>
            We use Razorpay as our primary payment gateway. By making a purchase, you agree to Razorpay's terms of service regarding payment processing. Prices for our products are subject to change without notice.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
