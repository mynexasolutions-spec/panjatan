import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BotanicalDivider from "@/components/BotanicalDivider";
import CmsContentBlocks from "@/components/CmsContentBlocks";
import { getContentPage } from "@/lib/cms";

export const metadata = {
  title: 'About Us | Panjatan Ayurveda',
  description: 'Learn about Panjatan Ayurveda and our commitment to safe, effective, and natural Ayurvedic healthcare.',
}

export default async function AboutPage() {
  const page = await getContentPage('about');
  if (!page) throw new Error('Published About content is missing.');
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner for About Page */}
      <section className="relative w-full py-16 md:py-24 bg-emerald-deep flex items-center justify-center overflow-hidden border-b border-cream-line">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-deep via-emerald/40 to-emerald-deep opacity-60" />
        
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

      <BotanicalDivider tone="emerald" />

      <div className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
          <CmsContentBlocks blocks={page.blocks} />
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
