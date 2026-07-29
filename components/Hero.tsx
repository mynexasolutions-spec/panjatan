"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Award, Leaf, Users, ArrowRight } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";

export default function Hero({ section }: { section?: HomepageSection }) {
  return (
    <section className="relative pt-[140px] md:pt-[150px] pb-12 md:pb-20 bg-gradient-to-b from-[#F2F7F4] via-[#F8FBF9] to-white overflow-hidden">
      {/* Background Subtle Leaf Accents */}
      <div className="absolute top-10 left-5 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-wrap mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0D3B23] tracking-tight leading-[1.12]">
              {section?.heading || "Heal Naturally with Panjatan Ayurveda"}
            </h1>

            {/* Subtitle */}
            <p className="text-gray-700 text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
              {section?.subheading || "Pure Ayurvedic Medicines for a Healthy Today & Better Tomorrow"}
            </p>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/90 border border-emerald-100 rounded-lg p-2.5 shadow-sm">
                <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-[11px] font-semibold text-gray-800 leading-tight">
                  100% Natural <br />
                  <span className="text-[10px] font-normal text-gray-500">Herbal Ingredients</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 border border-emerald-100 rounded-lg p-2.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-[11px] font-semibold text-gray-800 leading-tight">
                  GMP <br />
                  <span className="text-[10px] font-normal text-gray-500">Certified</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 border border-emerald-100 rounded-lg p-2.5 shadow-sm">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-[11px] font-semibold text-gray-800 leading-tight">
                  ISO <br />
                  <span className="text-[10px] font-normal text-gray-500">Certified</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 border border-emerald-100 rounded-lg p-2.5 shadow-sm">
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-[11px] font-semibold text-gray-800 leading-tight">
                  Trusted by <br />
                  <span className="text-[10px] font-normal text-gray-500">Thousands</span>
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-3 md:gap-4 pt-4">
              <a
                href={section?.link_url || "/shop"}
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-3.5 rounded-full bg-[#0A6C35] hover:bg-[#0D3B23] text-white font-bold text-sm tracking-wide shadow-md transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                {section?.link_label || "SHOP NOW"}
              </a>

              <a
                href="#categories"
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-3.5 rounded-full bg-white border border-[#0A6C35] text-[#0A6C35] hover:bg-emerald-50 font-bold text-sm tracking-wide shadow-sm transition-all whitespace-nowrap"
              >
                EXPLORE PRODUCTS
              </a>
            </div>

          </div>

          {/* Right Hero Product Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Trusted 20+ Years Stamp Overlay */}
            <div className="absolute -top-3 right-4 md:right-8 z-20 w-24 h-24 md:w-28 md:h-28 rounded-full bg-amber-50 border-2 border-amber-400 p-1.5 flex items-center justify-center text-center shadow-lg transform rotate-6">
              <div className="w-full h-full rounded-full border border-dashed border-amber-500/50 flex flex-col items-center justify-center p-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-900">TRUSTED</span>
                <span className="text-xl md:text-2xl font-black text-amber-700 leading-none">20+</span>
                <span className="text-[8px] uppercase tracking-tight font-bold text-amber-900 leading-tight">YEARS OF AYURVEDA</span>
              </div>
            </div>

            {/* Main Hero Banner Image */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/banner.webp"
                alt="Panjatan Ayurveda — Pachan Plus Churan"
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-cover"
                priority
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
