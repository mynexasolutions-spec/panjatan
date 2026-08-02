"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Leaf, Search, X } from "lucide-react";
import Reveal from "./Reveal";
import type { HomepageSectionItem } from "@/lib/cms";

export default function HerbsExplorer({ herbs }: { herbs: HomepageSectionItem[] }) {
  const [query, setQuery] = useState("");

  const filteredHerbs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return herbs;
    return herbs.filter((herb) =>
      [herb.title, herb.subtitle, herb.body].some((field) => field?.toLowerCase().includes(q))
    );
  }, [herbs, query]);

  return (
    <div className="max-w-wrap mx-auto px-5 md:px-8 py-12 md:py-20">
      {/* Search Bar */}
      <div className="max-w-lg mx-auto mb-10 md:mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search herbs by name or benefit (e.g. Ashwagandha, immunity)..."
            className="w-full bg-white border border-emerald-100/80 rounded-full pl-11 pr-11 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Herb Grid */}
      {herbs.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900 max-w-xl mx-auto">
          Herb details are being updated. Please check back soon.
        </div>
      ) : filteredHerbs.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center max-w-xl mx-auto">
          <p className="text-sm text-gray-600">
            No herbs match &ldquo;{query}&rdquo;. Try a different name or benefit.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 text-sm font-bold text-[#0A6C35] hover:text-[#0D3B23] transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredHerbs.map((herb, idx) => (
            <Reveal
              key={herb.id}
              delay={(idx % 4) as 0 | 1 | 2 | 3}
              className="group bg-white rounded-2xl border border-emerald-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 shrink-0 rounded-full bg-emerald-50 border border-emerald-200/60 overflow-hidden flex items-center justify-center">
                  {herb.image_url ? (
                    <Image
                      src={herb.image_url}
                      alt={herb.title}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Leaf className="w-7 h-7 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0D3B23] leading-snug">
                    {herb.title}
                  </h3>
                  {herb.subtitle && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      {herb.subtitle}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {herb.body || "Benefit details coming soon."}
              </p>

              {herb.link_url && (
                <a
                  href={herb.link_url}
                  className="mt-4 inline-flex items-center text-sm font-bold text-[#0A6C35] hover:text-[#0D3B23] transition-colors"
                >
                  Shop related products →
                </a>
              )}
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
