import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Story from "@/components/Story";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BotanicalDivider from "@/components/BotanicalDivider";

export const metadata = {
  title: 'About Us | Gulshan Modest',
  description: 'Learn about the story behind Gulshan Modest, rooted in modesty and grown with intention in Delhi NCR.',
}

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner for About Page */}
      <section className="relative w-full py-16 md:py-24 bg-emerald-deep flex items-center justify-center overflow-hidden border-b border-cream-line">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-deep via-emerald/40 to-emerald-deep opacity-60" />
        
        <div className="relative z-10 text-center px-5">
          <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3 text-gold-light">
            <span className="h-px w-6 bg-gold-light/50" />
            Our Heritage
            <span className="h-px w-6 bg-gold-light/50" />
          </div>
          <h1 className="font-display font-semibold text-3xl md:text-5xl text-cream tracking-tight">
            About Gulshan
          </h1>
          <p className="mt-4 text-cream/80 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            A garden of modest fashion, crafted with care and designed for the modern woman.
          </p>
        </div>
      </section>

      <BotanicalDivider tone="emerald" />

      <div className="flex-1">
        {/* We reuse the Story component which has the core information */}
        <Story />
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
