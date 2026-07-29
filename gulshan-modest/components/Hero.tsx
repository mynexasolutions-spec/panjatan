"use client";

import React from "react";
import { ShieldCheck, Award, Leaf, Users, ArrowRight } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";

export default function Hero({ section }: { section?: HomepageSection }) {
  return (
    <section className="relative pt-[120px] md:pt-[150px] pb-12 md:pb-20 bg-gradient-to-b from-[#F2F7F4] via-[#F8FBF9] to-white overflow-hidden">
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
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href={section?.link_url || "/shop"}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0A6C35] hover:bg-[#0D3B23] text-white font-bold text-sm tracking-wide shadow-md transition-all transform hover:-translate-y-0.5"
              >
                {section?.link_label || "SHOP NOW"}
              </a>

              <a
                href="#categories"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white border border-[#0A6C35] text-[#0A6C35] hover:bg-emerald-50 font-bold text-sm tracking-wide shadow-sm transition-all"
              >
                EXPLORE PRODUCTS
              </a>
            </div>

          </div>

          {/* Right Hero Product Graphic Box */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Trusted 20+ Years Stamp Overlay */}
            <div className="absolute -top-3 right-4 md:right-8 z-20 w-24 h-24 md:w-28 md:h-28 rounded-full bg-amber-50 border-2 border-amber-400 p-1.5 flex items-center justify-center text-center shadow-lg transform rotate-6">
              <div className="w-full h-full rounded-full border border-dashed border-amber-500/50 flex flex-col items-center justify-center p-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-900">TRUSTED</span>
                <span className="text-xl md:text-2xl font-black text-amber-700 leading-none">20+</span>
                <span className="text-[8px] uppercase tracking-tight font-bold text-amber-900 leading-tight">YEARS OF AYURVEDA</span>
              </div>
            </div>

            {/* Main Hero Banner Visual Container */}
            <div className="relative w-full max-w-md aspect-[4/3.5] bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 shadow-2xl overflow-hidden border border-emerald-700/40 flex flex-col justify-between">
              
              {/* Product Visual Mockup Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-black/40" />

              {/* Header inside graphic box */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-semibold tracking-wider uppercase">
                  ⭐ Top Seller Formulation
                </span>
              </div>

              {/* Center Box & Bottle Representation */}
              <div className="relative z-10 py-6 flex items-center justify-center gap-4">
                
                {/* Product Box Mockup */}
                <div className="w-32 md:w-36 bg-gradient-to-b from-white to-amber-50 border-2 border-emerald-600 rounded-xl p-3 shadow-2xl flex flex-col items-center text-center transform -rotate-3">
                  <div className="w-full bg-[#0D3B23] text-white py-1 text-[9px] font-bold rounded uppercase">
                    PANJATAN
                  </div>
                  <div className="my-2">
                    <h3 className="font-extrabold text-emerald-900 text-sm leading-tight">PACHAN PLUS</h3>
                    <p className="text-[10px] text-amber-800 font-semibold italic">Chatni</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center my-1">
                    <Leaf className="w-6 h-6 text-emerald-700" />
                  </div>
                  <span className="mt-1 text-[9px] bg-emerald-800 text-white px-2 py-0.5 rounded font-medium">
                    पाचन प्लस चटनी
                  </span>
                </div>

                {/* Product Bottle Mockup */}
                <div className="w-28 md:w-32 bg-gray-900 text-white rounded-2xl p-2.5 shadow-2xl border border-gray-700 flex flex-col items-center text-center transform rotate-2">
                  <div className="w-10 h-3 bg-black rounded-t-md border-b border-gray-800" />
                  <div className="w-full bg-gradient-to-b from-amber-50 to-white text-gray-900 rounded-lg p-2 my-1 border border-emerald-500">
                    <span className="text-[8px] font-bold text-emerald-800 uppercase block">PANJATAN</span>
                    <span className="text-xs font-black text-[#0D3B23] block leading-tight">PACHAN PLUS</span>
                    <span className="text-[9px] font-semibold text-amber-700 block">Chatni</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 mx-auto my-1 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-[8px] text-gray-600 block font-medium">Digestive Care 200g</span>
                  </div>
                </div>

              </div>

              {/* Bottom tag inside box */}
              <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-xl p-2.5 text-center text-white text-xs font-semibold flex items-center justify-between border border-white/10">
                <span>Pachan Plus Complete Digestive Care</span>
                <a href="/shop" className="text-amber-300 font-bold hover:underline flex items-center gap-1 text-xs">
                  Buy <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
