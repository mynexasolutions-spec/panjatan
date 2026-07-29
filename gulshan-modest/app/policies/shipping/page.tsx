import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Shipping & Delivery Policy | Gulshan Modest',
}

export default function ShippingPolicy() {
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-ink mb-8">Shipping & Delivery Policy</h1>
        
        <div className="prose prose-emerald prose-sm md:prose-base text-ink/80 max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>
          
          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">1. Processing Time</h3>
          <p>
            All standard orders are processed within 2-3 business days. Custom or made-to-measure orders require an additional 5-7 business days for processing and tailoring before dispatch.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">2. Shipping Timelines</h3>
          <p>
            We proudly ship across Pan-India from our studio in Delhi NCR. 
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Delhi NCR:</strong> 1-2 business days after dispatch.</li>
            <li><strong>Metro Cities:</strong> 3-4 business days after dispatch.</li>
            <li><strong>Rest of India:</strong> 5-7 business days after dispatch.</li>
          </ul>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">3. Shipping Charges</h3>
          <p>
            We offer free standard shipping on all orders above ₹3,000. For orders below this amount, a flat shipping fee of ₹150 applies. 
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">4. Tracking Your Order</h3>
          <p>
            Once your order has been dispatched, you will receive a tracking link via email and WhatsApp. Please allow up to 24 hours for the tracking information to update.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
