"use client";

import React, { useLayoutEffect, useRef } from "react";
import { ShieldCheck, Award, Flag, Leaf, CheckCircle2 } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";
import Reveal from "./Reveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function Certifications({ section }: { section: HomepageSection }) {
  const items = section.homepage_section_items || [];
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const rings = gsap.utils.toArray<SVGCircleElement>(".cert-ring", root);
    if (rings.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.set(rings, { strokeDashoffset: 300 });
    const triggers = ScrollTrigger.batch(rings, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          strokeDashoffset: 0,
          duration: prefersReducedMotion ? 0.4 : 1.1,
          ease: "power2.out",
          stagger: prefersReducedMotion ? 0 : 0.1,
        }),
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [items.length]);

  const icons = [ShieldCheck, Award, Flag, CheckCircle2, Leaf];
  const colors = [
    { stroke: "#059669", inner: "border-emerald-400", text: "text-emerald-700" },
    { stroke: "#2563EB", inner: "border-blue-400", text: "text-blue-700" },
    { stroke: "#D97706", inner: "border-amber-400", text: "text-amber-700" },
    { stroke: "#44403C", inner: "border-stone-400", text: "text-stone-700" },
    { stroke: "#059669", inner: "border-emerald-400", text: "text-emerald-700" },
  ];

  return (
    <section ref={sectionRef} className="py-14 md:py-18 bg-[#F8F6F0] border-t border-emerald-100/60">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D3B23]">
            {section.heading}
          </h2>
          {section.body && <p className="mt-2 text-sm text-gray-600">{section.body}</p>}
          <div className="w-10 h-1 bg-[#0A6C35] mx-auto rounded-full mt-2" />
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
          {items.map((item, index) => {
            const Icon = icons[index % icons.length];
            const color = colors[index % colors.length];
            return (
              <Reveal key={item.id} delay={(index % 4) as 0 | 1 | 2 | 3} className="flex flex-col items-center text-center group">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 group-hover:scale-110 transition-transform duration-300">
                  {/* Seal ring that draws itself in when this badge scrolls into view */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke={color.stroke}
                      strokeWidth="4"
                      strokeLinecap="round"
                      pathLength={300}
                      className="cert-ring"
                    />
                  </svg>
                  <div className="absolute inset-[7px] rounded-full bg-white shadow-md flex items-center justify-center p-2">
                    <div className={`w-full h-full rounded-full border border-dashed ${color.inner} flex flex-col items-center justify-center p-1`}>
                      <Icon className={`w-6 h-6 ${color.text} mb-1`} />
                      <span className="px-1 text-[8px] font-black uppercase leading-tight text-gray-800">{item.title}</span>
                    </div>
                  </div>
                </div>
                {item.subtitle && <span className="mt-2 text-xs font-semibold text-gray-600">{item.subtitle}</span>}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
