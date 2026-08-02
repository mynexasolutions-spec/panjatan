"use client";

import React from "react";
import Image from "next/image";
import { Leaf, Award, PackageCheck, Sparkles, Smile } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";
import Reveal from "./Reveal";

export default function Story({ section }: { section?: HomepageSection }) {
  return (
    <section className="py-16 md:py-24 bg-[#F8F6F0] relative overflow-hidden">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: About Image */}
          <Reveal className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-square group">
              <Image
                src="/about-panjatan.webp"
                alt="Panjatan Ayurveda — Mortar, pestle and natural herbs"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-amber-200/60">
                <div className="flex items-center gap-2 mb-1">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                    Authentic Formulations
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#0D3B23]">
                  Hand-crafted Ayurvedic blends backed by ancient texts & modern scientific purity.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Narrative & Stats Grid */}
          <Reveal delay={1} className="lg:col-span-7 space-y-6">

            {/* Tagline Header */}
            <div className="inline-flex items-center gap-2 text-emerald-700 text-xs md:text-sm font-bold uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <Leaf className="w-4 h-4" /> About Panjatan Ayurveda
            </div>

            {/* Title */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D3B23] leading-tight">
              {section?.heading || "About Panjatan Ayurveda"}
            </h2>

            {/* Paragraph */}
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              {section?.body || "Panjatan Ayurveda is committed to providing safe, effective and natural healthcare through the timeless wisdom of Ayurveda. Our products are manufactured in GMP & ISO certified units using the finest quality herbs."}
            </p>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">20+</div>
                <div className="text-xs text-gray-600 font-medium mt-1">Years of Trust</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">50+</div>
                <div className="text-xs text-gray-600 font-medium mt-1">Ayurvedic Products</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                  <Leaf className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">100%</div>
                <div className="text-xs text-gray-600 font-medium mt-1">Natural Ingredients</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                  <Smile className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">10L+</div>
                <div className="text-xs text-gray-600 font-medium mt-1">Happy Customers</div>
              </div>
            </div>

            {/* Button */}
            <div className="pt-2">
              <a
                href={section?.link_url || "/about"}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0A6C35] hover:bg-[#0D3B23] text-white font-bold text-sm tracking-wide shadow-md transition-all transform hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                {section?.link_label || "KNOW MORE ABOUT US"}
              </a>
            </div>

          </Reveal>

        </div>
      </div>
    </section>
  );
}
