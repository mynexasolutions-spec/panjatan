"use client";

import React from "react";
import { Leaf, ShieldCheck, Ban, Award, CheckCircle, HeartHandshake } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";

export default function WhyUs({ section }: { section: HomepageSection }) {
  const fallbackReasons = [
    {
      icon: Leaf,
      title: "100%",
      subtitle: "Ayurvedic",
    },
    {
      icon: ShieldCheck,
      title: "Natural & Safe",
      subtitle: "Ingredients",
    },
    {
      icon: Ban,
      title: "No Harmful",
      subtitle: "Chemicals",
    },
    {
      icon: Award,
      title: "GMP",
      subtitle: "Certified",
    },
    {
      icon: CheckCircle,
      title: "ISO",
      subtitle: "Certified",
    },
    {
      icon: HeartHandshake,
      title: "Quality You Can",
      subtitle: "Trust",
    },
  ];
  const reasons = section.homepage_section_items?.map((item) => ({
    title: item.title,
    subtitle: item.subtitle,
  })) || fallbackReasons;
  const icons = [Leaf, ShieldCheck, Ban, Award, CheckCircle, HeartHandshake];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B23]">
            {section.heading}
          </h2>
          <div className="w-12 h-1 bg-[#0A6C35] mx-auto rounded-full mt-3" />
        </div>

        {/* 6 Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {reasons.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 hover:bg-emerald-100/60 hover:border-emerald-300 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full bg-white text-[#0A6C35] border border-emerald-200 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-[#0D3B23] text-sm md:text-base leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
