"use client";

import React from "react";
import { ShieldCheck, Award, Flag, Leaf, CheckCircle2 } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";

export default function Certifications({ section }: { section: HomepageSection }) {
  const items = section.homepage_section_items || [];
  const icons = [ShieldCheck, Award, Flag, CheckCircle2, Leaf];
  const colors = [
    { border: "border-emerald-600", inner: "border-emerald-400", text: "text-emerald-700" },
    { border: "border-blue-600", inner: "border-blue-400", text: "text-blue-700" },
    { border: "border-amber-600", inner: "border-amber-400", text: "text-amber-700" },
    { border: "border-stone-700", inner: "border-stone-400", text: "text-stone-700" },
    { border: "border-emerald-600", inner: "border-emerald-400", text: "text-emerald-700" },
  ];

  return (
    <section className="py-14 md:py-18 bg-[#F8F6F0] border-t border-emerald-100/60">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">
            {section.heading}
          </h2>
          {section.body && <p className="mt-2 text-sm text-gray-600">{section.body}</p>}
          <div className="w-10 h-1 bg-[#0A6C35] mx-auto rounded-full mt-2" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
          {items.map((item, index) => {
            const Icon = icons[index % icons.length];
            const color = colors[index % colors.length];
            return (
              <div key={item.id} className="flex flex-col items-center text-center group">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 ${color.border} bg-white p-2 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <div className={`w-full h-full rounded-full border border-dashed ${color.inner} flex flex-col items-center justify-center p-1`}>
                    <Icon className={`w-6 h-6 ${color.text} mb-1`} />
                    <span className="px-1 text-[8px] font-black uppercase leading-tight text-gray-800">{item.title}</span>
                  </div>
                </div>
                {item.subtitle && <span className="mt-2 text-xs font-semibold text-gray-600">{item.subtitle}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
