"use client";

import React from "react";
import { naturalIngredients } from "@/lib/data";
import { Leaf } from "lucide-react";

export default function GoodnessOfNature() {
  return (
    <section className="py-14 md:py-16 bg-[#0D3B23] text-white overflow-hidden relative">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & CTA */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight text-white">
              Goodness of Nature in Every Product
            </h2>
            
            <div>
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-emerald-400/60 hover:bg-white hover:text-[#0D3B23] text-emerald-100 font-bold text-xs uppercase tracking-wider transition-all"
              >
                EXPLORE INGREDIENTS
              </a>
            </div>
          </div>

          {/* Right Ingredient Circles Row */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
              {naturalIngredients.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center shrink-0 group"
                >
                  {/* Round herb image representation */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-800/80 border-2 border-emerald-500/50 shadow-lg flex items-center justify-center mb-2 group-hover:scale-105 group-hover:border-emerald-300 transition-all">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/60 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-emerald-200" />
                    </div>
                  </div>
                  
                  {/* Herb Name */}
                  <span className="text-xs font-semibold text-emerald-100 group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
