"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Award, Flag, Leaf } from "lucide-react";

export default function Certifications() {
  return (
    <section className="py-14 md:py-18 bg-[#F8F6F0] border-t border-emerald-100/60">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">
            Our Certifications
          </h2>
          <div className="w-10 h-1 bg-[#0A6C35] mx-auto rounded-full mt-2" />
        </div>

        {/* 5 Certifications Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
          
          {/* Badge 1: VERIFIED GMP CERTIFIED */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-emerald-600 bg-white p-2 shadow-md flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border border-dashed border-emerald-500 flex flex-col items-center justify-center p-1">
                <ShieldCheck className="w-6 h-6 text-emerald-700 mb-0.5" />
                <span className="text-[9px] font-black uppercase text-emerald-800 leading-none">GMP</span>
                <span className="text-[7px] font-bold text-emerald-600 uppercase">CERTIFIED</span>
              </div>
            </div>
          </div>

          {/* Badge 2: CERTIFIED ISO COMPANY */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-600 bg-white p-2 shadow-md flex items-center justify-center text-blue-800 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border border-dashed border-blue-400 flex flex-col items-center justify-center p-1">
                <Award className="w-6 h-6 text-blue-700 mb-0.5" />
                <span className="text-[9px] font-black uppercase text-blue-900 leading-none">ISO</span>
                <span className="text-[7px] font-bold text-blue-700 uppercase">COMPANY</span>
              </div>
            </div>
          </div>

          {/* Badge 3: Ministry of AYUSH */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-600 bg-white p-2 shadow-md flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border border-dashed border-amber-400 flex flex-col items-center justify-center p-1">
                <Flag className="w-5 h-5 text-amber-700 mb-0.5" />
                <span className="text-[8px] font-black uppercase text-amber-900 leading-none">AYUSH</span>
                <span className="text-[6px] font-semibold text-gray-600 uppercase">GOVT. OF INDIA</span>
              </div>
            </div>
          </div>

          {/* Badge 4: MAKE IN INDIA */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-800 bg-white p-2 shadow-md flex items-center justify-center text-gray-900 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border border-dashed border-gray-400 flex flex-col items-center justify-center p-1">
                <span className="text-[10px] font-black uppercase tracking-tight text-gray-900 leading-none">MAKE IN</span>
                <span className="text-[9px] font-extrabold uppercase text-amber-700 leading-tight">INDIA</span>
              </div>
            </div>
          </div>

          {/* Badge 5: 100% AYURVEDIC */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-emerald-600 bg-white p-2 shadow-md flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border border-dashed border-emerald-500 flex flex-col items-center justify-center p-1">
                <Leaf className="w-6 h-6 text-emerald-700 mb-0.5" />
                <span className="text-[9px] font-black uppercase text-emerald-800 leading-none">100%</span>
                <span className="text-[7px] font-bold text-emerald-600 uppercase">AYURVEDIC</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
