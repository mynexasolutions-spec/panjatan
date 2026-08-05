"use client";

import React from "react";
import Image from "next/image";
import { Leaf, UserCheck, Shield, Truck } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";

type FeatureItem = {
  title: string;
  subtitle: string;
  image_url?: string | null;
};

export default function FeatureBar({ section }: { section?: HomepageSection }) {
  const fallbackFeatures: FeatureItem[] = [
    { title: "Organic Herbs", subtitle: "Carefully Sourced", image_url: null },
    { title: "Expert Formulated", subtitle: "Ayurvedic Experts", image_url: null },
    { title: "Safe & Natural", subtitle: "No Side Effects*", image_url: null },
    { title: "Fast Delivery", subtitle: "Pan India", image_url: null },
  ];
  const icons = [Leaf, UserCheck, Shield, Truck];

  const features: FeatureItem[] =
    section?.homepage_section_items && section.homepage_section_items.length > 0
      ? section.homepage_section_items.map((item) => ({
          title: item.title,
          subtitle: item.subtitle,
          image_url: item.image_url,
        }))
      : fallbackFeatures;

  // Duplicate the row so the marquee track (translateX 0 -> -50%, see
  // .marquee-track in globals.css) loops seamlessly with no visible seam.
  const looped = [...features, ...features];

  return (
    <section className="relative py-6 md:py-7 bg-[#0D3B23] overflow-hidden">
      {/* Edge fades so badges scroll in/out softly instead of clipping hard */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-24 z-10 bg-gradient-to-r from-[#0D3B23] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-24 z-10 bg-gradient-to-l from-[#0D3B23] to-transparent" />

      <div className="marquee-row overflow-hidden">
        <div className="marquee-track">
          {looped.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div key={index} className="flex items-center gap-3 md:gap-4 px-5 md:px-10 shrink-0">
                <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title} fill sizes="48px" className="object-cover" />
                  ) : (
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  )}
                </div>
                <div className="whitespace-nowrap">
                  <h4 className="font-extrabold text-white text-sm md:text-base leading-snug">{item.title}</h4>
                  <p className="text-xs text-emerald-100/80 font-medium mt-0.5">{item.subtitle}</p>
                </div>
                <span className="ml-2 md:ml-4 h-1.5 w-1.5 rounded-full bg-white/25 shrink-0" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
