import Image from "next/image";
import Reveal from "./Reveal";
import { lookbook, SITE } from "@/lib/data";

export default function Lookbook() {
  return (
    <section className="relative py-12 md:py-16 bg-cream-deep/60">
      <div className="max-w-wrap mx-auto px-5 md:px-8">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="eyebrow inline-flex items-center gap-2 justify-center md:justify-start">
              <span className="h-px w-6 bg-gold" />
              The Lookbook
            </div>
            <h2 className="section-heading mt-4">Styled by our community</h2>
          </div>
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-emerald text-emerald font-semibold text-sm hover:bg-emerald hover:text-cream transition-colors shrink-0"
          >
            Get Styling Help
          </a>
        </Reveal>

        {/* Clean, Symmetrical 3-Column Grid on Desktop / 2-Column on Mobile */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {lookbook.map((src, i) => (
            <Reveal
              key={src}
              delay={(i % 4) as 0 | 1 | 2 | 3}
            >
              <div className="group lift relative aspect-[3/4] rounded-2xl md:rounded-[24px] overflow-hidden shadow-card border border-gold/15 bg-cream">
                <Image
                  src={src}
                  alt="Gulshan Modest community styling"
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                
                {/* Premium Hover Overlay */}
                <div className="absolute inset-0 bg-emerald/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                  <span className="font-display font-medium text-cream text-[13px] md:text-[14px] tracking-widest uppercase border-b border-cream/40 pb-1">
                    Shop Look
                  </span>
                  <span className="text-[11px] text-cream/75 font-body">
                    @gulshan.modest
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 text-center md:hidden">
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-emerald text-emerald font-semibold text-sm hover:bg-emerald hover:text-cream transition-colors"
          >
            Get Styling Help
          </a>
        </Reveal>
      </div>
    </section>
  );
}
