import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BotanicalDivider from "@/components/BotanicalDivider";
import Reveal from "@/components/Reveal";
import HerbsExplorer from "@/components/HerbsExplorer";
import { IconWhatsapp } from "@/components/Icons";
import { Phone } from "lucide-react";
import { getStorefrontShell, getHomepageSectionByKey } from "@/lib/cms";

export const metadata = {
  title: "Herbs & Their Benefits | Panjatan Ayurveda",
  description:
    "Explore the pure Ayurvedic herbs behind every Panjatan Ayurveda formulation and the health benefits each one brings.",
};

export default async function HerbsPage() {
  const [shell, section] = await Promise.all([
    getStorefrontShell(),
    getHomepageSectionByKey("goodness-of-nature"),
  ]);

  const settings = shell.settings;
  const herbs = section?.homepage_section_items || [];

  const consultMessage = `Hi ${settings.site_name}! I would like to consult a doctor and book an Ayurvedic consultation appointment.`;
  const consultWhatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(consultMessage)}`;

  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-cream min-h-screen flex flex-col">
      <Header />

      {/* Hero Banner */}
      <section className="relative w-full py-16 md:py-24 bg-emerald-deep flex items-center justify-center overflow-hidden border-b border-cream-line">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-deep via-emerald/40 to-emerald-deep opacity-60" />
        <div className="relative z-10 text-center px-5">
          <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3 text-gold-light">
            <span className="h-px w-6 bg-gold-light/50" />
            Goodness of Nature
            <span className="h-px w-6 bg-gold-light/50" />
          </div>
          <h1 className="font-display font-semibold text-3xl md:text-5xl text-cream tracking-tight">
            Herbs &amp; Their Ayurvedic Benefits
          </h1>
          <p className="mt-4 text-cream/80 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            {section?.body || "Discover the pure, time-tested herbs behind every Panjatan Ayurveda formulation and the wellness each one brings."}
          </p>
        </div>
      </section>

      <BotanicalDivider tone="emerald" />

      {/* Herb Search & Grid */}
      <div className="flex-1">
        <HerbsExplorer herbs={herbs} />
      </div>

      <BotanicalDivider tone="gold" flip />

      {/* Consult a Doctor CTA */}
      <section className="bg-[#F8F6F0] border-t border-emerald-100/60 py-14 md:py-20">
        <Reveal className="max-w-2xl mx-auto text-center px-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-emerald-700" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">
            Need Personalized Guidance?
          </h2>
          <p className="mt-3 text-gray-600 text-sm md:text-base leading-relaxed">
            Talk to our Ayurvedic experts to find the right formulation for your health needs, or book a consultation appointment.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={consultWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 justify-center px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb856] text-white font-bold text-sm tracking-wide shadow-md transition-all transform hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              <IconWhatsapp className="w-5 h-5" />
              Consult a Doctor on WhatsApp
            </a>
            <a
              href="/shop"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white border border-[#0A6C35] text-[#0A6C35] hover:bg-emerald-50 font-bold text-sm tracking-wide shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              Browse Products
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-500">{settings.business_hours}</p>
        </Reveal>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
