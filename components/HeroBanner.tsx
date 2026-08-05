"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DbHomeBannerImage } from "@/lib/queries";

export type HeroBannerSlide = {
  id: string;
  image_url: string;
  link_url: string | null;
};

const DEFAULT_BANNER_LINK = "/shop";

function BannerTrack({
  slides,
  aspectClasses,
  priority,
}: {
  slides: HeroBannerSlide[];
  aspectClasses: string;
  priority: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalMs = 5000;

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  return (
    <div
      className={`relative w-full ${aspectClasses} overflow-hidden rounded-[22px] sm:rounded-[28px] md:rounded-[32px] shadow-lg border border-white/70 bg-gradient-to-br from-[#F2F7F4] via-[#F8FBF9] to-white`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Sliding track — all slides sit side by side; we translate the whole
          track so images glide horizontally instead of cross-fading. */}
      <motion.div
        className="flex h-full"
        animate={{ x: `-${index * 100}%` }}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      >
        {slides.map((slide, i) => {
          const image = (
            <Image
              src={slide.image_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1400px"
              className="object-cover"
              priority={priority && i === 0}
            />
          );

          return (
            <div key={slide.id} className="relative h-full w-full shrink-0">
              <Link href={slide.link_url || DEFAULT_BANNER_LINK} className="relative block h-full w-full" aria-label="Shop now">
                {image}
              </Link>
            </div>
          );
        })}
      </motion.div>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-[#0A6C35]" : "w-1.5 bg-[#0A6C35]/30 hover:bg-[#0A6C35]/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroBanner({ images }: { images: DbHomeBannerImage[] }) {
  const toSlide = (img: DbHomeBannerImage): HeroBannerSlide => ({
    id: img.id,
    image_url: img.image_url,
    link_url: img.link_url,
  });

  const desktopSlides = images.filter((img) => img.device_type === "desktop").map(toSlide);
  const mobileSlides = images.filter((img) => img.device_type === "mobile").map(toSlide);

  // If admin only uploaded one device's images, use it for both breakpoints
  // rather than showing an empty banner.
  const effectiveDesktop = desktopSlides.length > 0 ? desktopSlides : mobileSlides;
  const effectiveMobile = mobileSlides.length > 0 ? mobileSlides : desktopSlides;

  if (effectiveDesktop.length === 0 && effectiveMobile.length === 0) {
    return (
      <section className="relative pt-[140px] md:pt-[150px] px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="relative w-full max-w-wrap mx-auto aspect-[4/5] sm:aspect-[16/9] md:aspect-[12/5] rounded-[22px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden shadow-lg">
          <Image src="/banner.webp" alt="Panjatan Ayurveda" fill sizes="100vw" className="object-cover" priority />
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-[140px] md:pt-[150px] px-3 sm:px-4 md:px-6 lg:px-8 pb-3 md:pb-4">
      <div className="max-w-wrap mx-auto">
        {/* Mobile banner — taller crop so nothing important is cut off on small screens */}
        <div className="md:hidden">
          <BannerTrack slides={effectiveMobile} aspectClasses="aspect-[4/5] sm:aspect-[16/9]" priority />
        </div>

        {/* Desktop / PC banner — wide crop, scales fluidly with viewport width */}
        <div className="hidden md:block">
          <BannerTrack slides={effectiveDesktop} aspectClasses="aspect-[12/5]" priority />
        </div>
      </div>
    </section>
  );
}
