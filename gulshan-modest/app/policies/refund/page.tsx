import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Refund & Cancellation Policy | Gulshan Modest',
}

export default function RefundPolicy() {
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-ink mb-8">Refund & Cancellation Policy</h1>
        
        <div className="prose prose-emerald prose-sm md:prose-base text-ink/80 max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>
          
          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">1. Cancellations</h3>
          <p>
            Orders can be cancelled within 24 hours of placement for a full refund. To cancel your order, please contact our support team on WhatsApp or via email immediately. Once an order has been dispatched, it cannot be cancelled.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">2. Returns</h3>
          <p>
            We offer a 7-day return window for items that are unused, unwashed, and have all original tags intact. If 7 days have gone by since your purchase was delivered, unfortunately, we cannot offer you a refund or exchange.
          </p>
          <p>To initiate a return, please contact us with your order number and reason for return.</p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">3. Refunds</h3>
          <p>
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed and automatically applied to your original method of payment (via Razorpay) within 5-7 business days.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">4. Non-Returnable Items</h3>
          <p>
            Custom orders, personalized items, and clearance sale items are non-returnable and non-refundable unless they are received damaged or defective.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
