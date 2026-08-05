"use client";

import React from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";
import type { HomepageSection, SiteSettings } from "@/lib/cms";
import Reveal from "./Reveal";
import { IconWhatsapp } from "./Icons";

export default function GoodnessOfNature({ section, settings }: { section: HomepageSection; settings?: SiteSettings }) {
  const ingredients = section.homepage_section_items || [];
  const consultMessage = `Hi ${settings?.site_name || "Panjatan Ayurveda"}! I would like to consult a doctor and book an Ayurvedic consultation appointment.`;
  const consultWhatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(consultMessage)}`
    : undefined;
  return (
    <section className="py-14 md:py-16 bg-[#0D3B23] text-white overflow-hidden relative">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & CTA */}
          <Reveal className="lg:col-span-4 space-y-5 text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight text-white">
              {section.heading}
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/herbs"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-emerald-400/60 hover:bg-white hover:text-[#0D3B23] text-emerald-100 font-bold text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                {section.link_label || "EXPLORE INGREDIENTS"}
              </a>

              {consultWhatsappUrl && (
                <a
                  href={consultWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 justify-center px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1fb856] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all transform hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                >
                  <IconWhatsapp className="w-4 h-4" />
                  Consult a Doctor
                </a>
              )}
            </div>
          </Reveal>

          {/* Right Ingredient Circles Row */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
              {ingredients.map((item, idx) => (
                <Reveal
                  key={idx}
                  delay={(idx % 4) as 0 | 1 | 2 | 3}
                  className="flex flex-col items-center text-center shrink-0 group"
                >
                  {/* Herb image — real photo when uploaded, leaf icon fallback otherwise */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-800/80 border-2 border-emerald-500/50 shadow-lg overflow-hidden flex items-center justify-center mb-2 group-hover:scale-105 group-hover:border-emerald-300 transition-all">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600/60 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-emerald-200" />
                      </div>
                    )}
                  </div>
                  
                  {/* Herb Name */}
                  <span className="text-xs font-semibold text-emerald-100 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
