"use client";

import React from "react";
import { Leaf, ShieldCheck, Ban, Award, CheckCircle, HeartHandshake } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";
import Reveal from "./Reveal";

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
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B23]">
            {section.heading}
          </h2>
          <div className="w-12 h-1 bg-[#0A6C35] mx-auto rounded-full mt-3" />
        </Reveal>

        {/* 6 Reasons — airy icon list, deliberately lighter than the certification seals below */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {reasons.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <Reveal
                key={idx}
                delay={(idx % 4) as 0 | 1 | 2 | 3}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative w-14 h-14 flex items-center justify-center mb-3">
                  <span className="absolute inset-0 rounded-full bg-emerald-50 scale-90 group-hover:scale-100 group-hover:bg-emerald-100 transition-all duration-300" />
                  <Icon className="relative w-7 h-7 text-[#0A6C35] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="font-extrabold text-[#0D3B23] text-sm md:text-base leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {item.subtitle}
                </p>
                <span className="mt-2.5 h-[2px] w-6 bg-[#0A6C35]/40 group-hover:w-10 group-hover:bg-[#0A6C35] transition-all duration-300 rounded-full" />
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
