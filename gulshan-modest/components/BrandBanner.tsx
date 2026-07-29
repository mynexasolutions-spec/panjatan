import Image from "next/image";
import Link from "next/link";

export default function BrandBanner() {
  return (
    <section 
      className="relative overflow-hidden pt-12 md:pt-16 pb-12 md:pb-16 border-y border-gold/10 min-h-[450px] flex items-center"
      style={{ backgroundImage: "linear-gradient(135deg, #FDFBF7 0%, #F5ECE0 60%, #E6DAC4 100%)" }}
    >
      <div className="max-w-wrap mx-auto px-5 md:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Brand Content and CTA (Centered) */}
          <div className="flex flex-col items-center text-center py-10 lg:py-16 justify-center">
            {/* Monogram Logo */}
            <div className="relative w-16 h-16 mb-4 mix-blend-multiply">
              <Image
                src="/logo-dark.webp"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Brand Title */}
            <h3 className="font-display font-bold text-2xl md:text-3xl tracking-[0.15em] text-emerald uppercase">
              Gulshan Modest<span className="text-[10px] uppercase align-super font-medium">tm</span>
            </h3>

            {/* Cursive Subtitle */}
            <p className="mt-3 font-display italic text-3xl md:text-4xl text-[#B9893F] leading-none">
              Where Modesty Meets Elegance
            </p>
            <div className="w-24 h-[1px] bg-gold/50 my-4" />

            {/* Main Subtitle */}
            <p className="text-base md:text-lg text-emerald/80 font-body max-w-[480px]">
              Premium Islamic Fashion For Women & Girls
            </p>

            {/* CTA Button */}
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-[#1E3B2E] text-cream font-body font-semibold text-[15px] tracking-wide shadow-card hover:bg-emerald-deep transition-all hover:scale-[1.02]"
            >
              Shop Collection
            </Link>
          </div>

          {/* Right Column: Premium Model Image with Rounded Corners */}
          <div className="relative w-full h-[350px] md:h-[480px] lg:h-[520px] rounded-[32px] overflow-hidden shadow-soft border border-gold/15 bg-cream-deep">
            <Image
              src="/model-cream-hijab.png"
              alt="Gulshan Modest Premium Wear"
              fill
              sizes="(max-width: 1024px) 100vw, 550px"
              className="object-cover object-center transition-all duration-700 hover:scale-[1.03]"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
