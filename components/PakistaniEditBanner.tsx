import Image from "next/image";
import Link from "next/link";

export default function PakistaniEditBanner() {
  return (
    <section 
      className="relative overflow-hidden pt-12 md:pt-16 pb-12 md:pb-16 border-y border-gold/10 min-h-[450px] flex items-center bg-emerald-deep"
    >
      <div className="max-w-wrap mx-auto px-5 md:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Premium Model Image with Rounded Corners */}
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[560px] rounded-[32px] overflow-hidden shadow-soft border border-gold/20 order-2 lg:order-1">
            <Image
              src="/pakistani-suit-banner.webp"
              alt="The Pakistani Edit - Premium Suits"
              fill
              sizes="(max-width: 1024px) 100vw, 550px"
              className="object-cover object-center transition-all duration-700 hover:scale-[1.03]"
            />
          </div>

          {/* Right Column: Brand Content and CTA (Centered) */}
          <div className="flex flex-col items-center text-center py-10 lg:py-16 justify-center order-1 lg:order-2">
            {/* Monogram Logo */}
            <div className="relative w-16 h-16 mb-6">
              <Image
                src="/logo-light.webp"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Brand Title */}
            <h3 className="font-display font-bold text-sm md:text-base tracking-[0.25em] text-gold-light uppercase">
              Exclusive Collection
            </h3>

            {/* Cursive Subtitle */}
            <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl text-cream leading-tight">
              The <span className="italic text-gold font-medium">Pakistani</span> Edit
            </h2>
            
            <div className="w-24 h-[1px] bg-gold/30 my-6" />

            {/* Main Subtitle */}
            <p className="text-base md:text-lg text-cream/70 font-body max-w-[420px] leading-relaxed">
              Intricate gold embroidery, fluid silhouettes, and premium fabrics. Discover our curated range of luxury Pakistani suits designed for elegance.
            </p>

            {/* CTA Button */}
            <Link
              href="/shop?search=pakistani"
              className="mt-10 inline-flex items-center justify-center px-10 py-3.5 rounded-full border border-gold text-gold font-body font-semibold text-[15px] tracking-wide hover:bg-gold hover:text-emerald-deep transition-all hover:scale-[1.02]"
            >
              Shop The Edit
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
