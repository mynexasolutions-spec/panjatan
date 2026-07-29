import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CmsContentBlocks from "@/components/CmsContentBlocks";
import { getContentPage, getStorefrontShell } from "@/lib/cms";

export const metadata = {
  title: 'Contact Us | Panjatan Ayurveda',
  description: 'Get in touch with Panjatan Ayurveda for product queries, orders, or feedback.',
}

export default async function ContactPage() {
  const [page, shell] = await Promise.all([getContentPage('contact'), getStorefrontShell()]);
  if (!page) throw new Error('Published Contact content is missing.');
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner for Contact Page */}
      <section className="relative w-full py-16 md:py-24 bg-emerald-deep flex items-center justify-center overflow-hidden border-b border-cream-line">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-[#0f2118] to-[#0a1610] opacity-90" />
        
        <div className="relative z-10 text-center px-5">
          <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3 text-gold-light">
            <span className="h-px w-6 bg-gold-light/50" />
            {page.eyebrow}
            <span className="h-px w-6 bg-gold-light/50" />
          </div>
          <h1 className="font-display font-semibold text-3xl md:text-5xl text-cream tracking-tight">
            {page.title}
          </h1>
          <p className="mt-4 text-cream/80 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            {page.summary}
          </p>
        </div>
      </section>

      <div className="flex-1">
        <div className="mx-auto max-w-3xl px-5 pt-12">
          <CmsContentBlocks blocks={page.blocks} />
        </div>
        <Contact settings={shell.settings} />
      </div>
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
