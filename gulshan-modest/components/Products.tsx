"use client";

import React from "react";
import { featuredProducts as defaultFeatured } from "@/lib/data";
import { Star, Leaf } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface ProductsProps {
  products?: any[];
  categories?: any[];
  title?: string;
  subtitle?: string;
}

export default function Products({
  products = defaultFeatured,
  title = "Featured Products",
  subtitle,
}: ProductsProps) {
  const { addToCart } = useCart();

  const list = products && products.length > 0 ? products : defaultFeatured;

  return (
    <section className="py-16 md:py-24 bg-[#F8F6F0]">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D3B23]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-600 font-medium mt-1">{subtitle}</p>
          )}
          <div className="w-12 h-1 bg-[#0A6C35] mx-auto rounded-full mt-3" />
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6">
          {list.slice(0, 5).map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-b from-[#F2F7F4] to-white border-b border-gray-100 overflow-hidden">
                  {item.image && !item.image.startsWith("/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-2xl bg-[#0D3B23] text-white shadow-lg p-3 flex flex-col items-center justify-center text-center border-2 border-emerald-500/40">
                        <Leaf className="w-6 h-6 text-emerald-400 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute top-2 left-2 bg-[#0A6C35] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide z-10">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-extrabold text-gray-900 text-sm md:text-base leading-snug line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">
                    {item.description || item.category}
                  </p>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium ml-1">
                      ({item.reviewsCount || 180})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-gray-900">
                      ₹{item.price}
                    </span>
                    {item.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{item.oldPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Add to cart Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-2.5 rounded-lg bg-[#0A6C35] hover:bg-[#0D3B23] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-gray-400 text-gray-800 hover:bg-[#0D3B23] hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            VIEW ALL PRODUCTS
          </a>
        </div>

      </div>
    </section>
  );
}
