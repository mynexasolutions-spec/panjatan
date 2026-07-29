"use client";

import React from "react";
import { Leaf, Award, PackageCheck, Sparkles, Smile } from "lucide-react";

export default function Story() {
  return (
    <section className="py-16 md:py-24 bg-[#F8F6F0] relative overflow-hidden">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Mortar & Pestle Visual Container */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-b from-amber-100 to-amber-900/20 aspect-[4/3] sm:aspect-square flex items-center justify-center group">
              
              {/* Graphic background representing mortar, pestle and herbs */}
              <div className="absolute inset-0 bg-[#2D4536] mix-blend-multiply opacity-30" />
              
              <div className="relative z-10 text-center p-8 flex flex-col items-center justify-center">
                {/* Mortar Pestle Icon illustration */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/90 shadow-xl border-4 border-amber-600/30 flex items-center justify-center mb-4 transform group-hover:scale-105 transition-transform">
                  <div className="relative">
                    <Leaf className="w-12 h-12 md:w-16 md:h-16 text-emerald-800" />
                    <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-amber-200/60 max-w-xs">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block">
                    Authentic Formulations
                  </span>
                  <p className="text-xs font-semibold text-[#0D3B23] mt-1">
                    Hand-crafted Ayurvedic blends backed by ancient texts & modern scientific purity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Stats Grid */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline Header */}
            <div className="inline-flex items-center gap-2 text-emerald-700 text-xs md:text-sm font-bold uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <Leaf className="w-4 h-4" /> About Panjatan Ayurveda
            </div>

            {/* Title */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D3B23] leading-tight">
              About Panjatan Ayurveda
            </h2>

            {/* Paragraph */}
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              Panjatan Ayurveda is committed to providing safe, effective and natural healthcare through the timeless wisdom of Ayurveda. Our products are manufactured in GMP &amp; ISO certified units using the finest quality herbs.
            </p>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">20+</div>
                <div className="text-xs text-gray-600 font-medium mt-1">Years of Trust</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">50+</div>
                <div className="text-xs text-gray-600 font-medium mt-1">Ayurvedic Products</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                  <Leaf className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">100%</div>
                <div className="text-xs text-gray-600 font-medium mt-1">Natural Ingredients</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm text-center">
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
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0A6C35] hover:bg-[#0D3B23] text-white font-bold text-sm tracking-wide shadow-md transition-all"
              >
                KNOW MORE ABOUT US
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
