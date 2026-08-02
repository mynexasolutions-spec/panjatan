"use client";

import React, { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";
import Reveal from "./Reveal";

export default function Testimonials({ section }: { section: HomepageSection }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const testimonials = section.homepage_section_items || [];

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth || 300;
    el.scrollBy({ left: direction === "left" ? -cardWidth - 16 : cardWidth + 16, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Heading */}
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B23]">
            {section.heading}
          </h2>
          <div className="w-12 h-1 bg-[#0A6C35] mx-auto rounded-full mt-3" />
        </Reveal>

        {/* Swipeable Carousel */}
        <div className="relative max-w-5xl mx-auto">

          {/* Arrow Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0A6C35] text-white flex items-center justify-center shadow-lg hover:bg-[#0D3B23] hover:scale-110 active:scale-90 transition-all animate-fade-in"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0A6C35] text-white flex items-center justify-center shadow-lg hover:bg-[#0D3B23] hover:scale-110 active:scale-90 transition-all animate-fade-in"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Row */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((item, idx) => (
              <Reveal
                key={idx}
                delay={(idx % 4) as 0 | 1 | 2 | 3}
                className="snap-start shrink-0 w-[80vw] sm:w-[340px] md:w-[360px] bg-[#F8F6F0] p-6 rounded-2xl border border-emerald-100/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex text-amber-500 mb-3">
                    {[...Array(Number(item.metadata?.rating) || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-gray-700 text-sm leading-relaxed italic">
                    &ldquo;{item.body}&rdquo;
                  </p>
                </div>

                {/* Author Name */}
                <div className="mt-6 pt-4 border-t border-gray-200/60">
                  <span className="font-bold text-[#0D3B23] text-sm block">
                    – {item.title}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
