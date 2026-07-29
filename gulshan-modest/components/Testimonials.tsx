"use client";

import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageSection } from "@/lib/cms";

export default function Testimonials({ section }: { section: HomepageSection }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = section.homepage_section_items || [];

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? Math.max(0, testimonials.length - 1) : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B23]">
            {section.heading}
          </h2>
          <div className="w-12 h-1 bg-[#0A6C35] mx-auto rounded-full mt-3" />
        </div>

        {/* Carousel / Cards Grid with Arrow Controls */}
        <div className="relative max-w-5xl mx-auto flex items-center gap-4">
          
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-[#0A6C35] text-white flex items-center justify-center shadow-md hover:bg-[#0D3B23] transition-colors shrink-0"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F8F6F0] p-6 rounded-2xl border border-emerald-100/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
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
                    "{item.body}"
                  </p>
                </div>

                {/* Author Name */}
                <div className="mt-6 pt-4 border-t border-gray-200/60">
                  <span className="font-bold text-[#0D3B23] text-sm block">
                    – {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-[#0A6C35] text-white flex items-center justify-center shadow-md hover:bg-[#0D3B23] transition-colors shrink-0"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

      </div>
    </section>
  );
}
