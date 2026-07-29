import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Contact Us | Gulshan Modest',
  description: 'Get in touch with Gulshan Modest for any queries, custom orders, or feedback.',
}

export default function ContactPage() {
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner for Contact Page */}
      <section className="relative w-full py-16 md:py-24 bg-emerald-deep flex items-center justify-center overflow-hidden border-b border-cream-line">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-[#0f2118] to-[#0a1610] opacity-90" />
        
        <div className="relative z-10 text-center px-5">
          <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3 text-gold-light">
            <span className="h-px w-6 bg-gold-light/50" />
            Here to Help
            <span className="h-px w-6 bg-gold-light/50" />
          </div>
          <h1 className="font-display font-semibold text-3xl md:text-5xl text-cream tracking-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-cream/80 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Have a question about a product, sizing, or a custom order? Reach out and we'll be happy to assist you.
          </p>
        </div>
      </section>

      <div className="flex-1">
        <Contact />
      </div>
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
