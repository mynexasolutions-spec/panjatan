"use client";

import React, { useRef } from "react";
import { categories as defaultCategories } from "@/lib/data";
import { ChevronLeft, ChevronRight, Activity, Shield, Heart, HeartPulse, Stethoscope, Droplets, Sparkles, Wind, Flame } from "lucide-react";

export default function Categories({ categories, title = "Shop by Health Category" }: { categories?: any[]; title?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const allowDevMocks = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_CMS_DEV_MOCKS === "true";
  const list = categories && categories.length > 0 ? categories : (allowDevMocks ? defaultCategories : (categories || []));

  // Custom Icon mapping for health categories
  const getCategoryIcon = (id: string, index: number) => {
    switch (id) {
      case "digestive-care":
        return <Activity className="w-7 h-7 text-emerald-600" />;
      case "joint-pain-relief":
        return <HeartPulse className="w-7 h-7 text-emerald-600" />;
      case "womens-health":
        return <Heart className="w-7 h-7 text-emerald-600" />;
      case "diabetes-care":
        return <Droplets className="w-7 h-7 text-emerald-600" />;
      case "immunity-booster":
        return <Shield className="w-7 h-7 text-emerald-600" />;
      case "liver-care":
        return <Flame className="w-7 h-7 text-emerald-600" />;
      case "hair-care":
        return <Sparkles className="w-7 h-7 text-emerald-600" />;
      case "skin-care":
        return <Stethoscope className="w-7 h-7 text-emerald-600" />;
      case "respiratory-care":
        return <Wind className="w-7 h-7 text-emerald-600" />;
      default:
        return <Activity className="w-7 h-7 text-emerald-600" />;
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="categories" className="py-16 md:py-20 bg-white">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B23]">
            {title}
          </h2>
          <div className="w-12 h-1 bg-[#0A6C35] mx-auto rounded-full mt-3" />
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Categories Horizontal Scroll Track */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-4 px-2"
          >
          {list.map((cat, idx) => (
              <a
                key={cat.id || idx}
                href={`/shop?category=${cat.id}`}
                className="flex flex-col items-center text-center shrink-0 w-28 sm:w-32 group/cat transition-transform transform hover:-translate-y-1"
              >
                {/* Circular image or icon badge */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50/80 border border-emerald-100 group-hover/cat:border-emerald-400 group-hover/cat:bg-emerald-100/60 shadow-sm overflow-hidden flex items-center justify-center transition-all mb-3">
                  {cat.image && !cat.image.startsWith("/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover/cat:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    getCategoryIcon(cat.id, idx)
                  )}
                </div>
                
                {/* Category Name */}
                <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover/cat:text-[#0A6C35] transition-colors leading-snug">
                  {cat.name}
                </span>
              </a>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

      </div>
    </section>
  );
}
