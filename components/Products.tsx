"use client";

import React, { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Reveal from "./Reveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface ProductsProps {
  products?: any[];
  categories?: any[];
  title?: string;
  subtitle?: string;
}

export default function Products({
  products,
  title = "Featured Products",
  subtitle,
}: ProductsProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);

  const list = products && products.length > 0 ? products : [];

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = gsap.utils.toArray<HTMLElement>(".product-card", grid);
    if (cards.length === 0) return;

    // Even under reduced-motion we keep a soft opacity fade (no translate/scale) —
    // fully static cards make it look like the feature is broken rather than
    // intentionally toned down.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fromVars = prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 70, scale: 0.9 };
    const toVars = prefersReducedMotion
      ? { opacity: 1, duration: 0.4, stagger: 0.04, overwrite: true }
      : { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.5)", stagger: 0.1, overwrite: true };

    gsap.set(cards, fromVars);
    const triggers = ScrollTrigger.batch(cards, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, toVars),
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [list.length]);

  return (
    <section className="py-16 md:py-24 bg-[#F8F6F0]">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Section Title */}
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B23]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-600 font-medium mt-1">{subtitle}</p>
          )}
          <div className="w-12 h-1 bg-[#0A6C35] mx-auto rounded-full mt-3" />
        </Reveal>

        {/* Empty State */}
        {list.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
            Featured products are temporarily unavailable.
          </div>
        )}

        {/* Product Grid — cards fly in on scroll via GSAP ScrollTrigger, see useEffect above */}
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {list.slice(0, 10).map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="product-card lift group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-cream-line/80 flex flex-col"
            >
              {/* Product Image */}
              <Link href={`/shop/${item.slug || item.id}`} className="relative aspect-[4/5] overflow-hidden block bg-cream-deep/20">
                <Image
                  src={item.image_url || item.image || "/image.png"}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {item.badge && (
                  <span className="absolute top-3 left-3 bg-emerald text-cream text-[9px] md:text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-sm">
                    {item.badge}
                  </span>
                )}
                {item.category && (
                  <span className="absolute bottom-3 right-3 bg-gold text-cream text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded shadow-sm">
                    {item.category}
                  </span>
                )}
              </Link>

              {/* Content */}
              <div className="p-3 md:p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <Link href={`/shop/${item.slug || item.id}`} className="hover:text-emerald transition-colors">
                    <h3 className="font-display font-semibold text-ink text-[13px] md:text-[15px] leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                </div>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-display font-bold text-ink text-[14px] md:text-base">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </span>
                  {item.oldPrice && (
                    <span className="text-ink/40 text-[12px] line-through">
                      ₹{Number(item.oldPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <button
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image_url: item.image_url || item.image || "/image.png",
                        category_name: item.category || "",
                        variant_id: item.variant_id,
                        variant_name: item.variant_name,
                      })
                    }
                    className="w-full text-center rounded-lg border border-emerald/50 text-emerald text-[13px] md:text-sm font-bold py-2.5 hover:bg-emerald hover:border-emerald hover:text-cream transition-all active:scale-95 flex items-center justify-center"
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image_url: item.image_url || item.image || "/image.png",
                        category_name: item.category || "",
                        variant_id: item.variant_id,
                        variant_name: item.variant_name,
                      });
                      router.push("/checkout");
                    }}
                    className="w-full text-center rounded-lg bg-emerald text-cream text-[13px] md:text-sm font-bold py-2.5 hover:bg-emerald-deep transition-all active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-gray-400 text-gray-800 hover:bg-[#0D3B23] hover:text-white font-bold text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            VIEW ALL PRODUCTS
          </a>
        </div>

      </div>
    </section>
  );
}
