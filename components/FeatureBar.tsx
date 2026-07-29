"use client";

import React from "react";
import { Leaf, UserCheck, Shield, Truck } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";

export default function FeatureBar({ section }: { section?: HomepageSection }) {
  const fallbackFeatures = [
    {
      icon: Leaf,
      title: "Organic Herbs",
      subtitle: "Carefully Sourced",
    },
    {
      icon: UserCheck,
      title: "Expert Formulated",
      subtitle: "Ayurvedic Experts",
    },
    {
      icon: Shield,
      title: "Safe & Natural",
      subtitle: "No Side Effects*",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      subtitle: "Pan India",
    },
  ];
  const features = section?.homepage_section_items?.map((item) => ({
    title: item.title,
    subtitle: item.subtitle,
  })) || fallbackFeatures;
  const icons = [Leaf, UserCheck, Shield, Truck];

  return (
    <section className="py-8 bg-white border-y border-emerald-100/60 shadow-sm relative z-20">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {features.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#FBFDFB] border border-emerald-100/80 shadow-card hover:border-emerald-300 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#0A6C35] flex items-center justify-center shrink-0 group-hover:bg-[#0A6C35] group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0D3B23] text-sm md:text-base leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
