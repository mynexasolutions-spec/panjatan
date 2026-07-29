"use client";

import React, { useState } from "react";
import { Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, MessageCircle, Leaf } from "lucide-react";
import { SITE } from "@/lib/data";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      alert("Thank you for subscribing to Panjatan Ayurveda updates!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0B301B] text-white pt-14 md:pt-16 pb-8 border-t border-emerald-950">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-emerald-800/60">
          
          {/* Column 1: Brand Info (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white text-[#0D3B23] flex items-center justify-center font-bold text-lg">
                <Leaf className="w-5 h-5 text-[#0A6C35]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tight uppercase text-white">
                  Panjatan
                </span>
                <span className="text-[9px] tracking-[0.25em] font-extrabold text-emerald-400 uppercase -mt-1">
                  Ayurveda
                </span>
              </div>
            </a>

            <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed max-w-sm">
              Bringing the power of Ayurveda to your door. Natural care for a healthy life.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-white text-base tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-y-2 text-xs md:text-sm font-medium text-emerald-100/80">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/shop" className="hover:text-white transition-colors">Products</a></li>
              <li><a href="#categories" className="hover:text-white transition-colors">Categories</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/policies" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="/policies" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Care (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-white text-base tracking-wide uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-emerald-100/80">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${SITE.phoneHref}`} className="hover:text-white">{SITE.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mon - Sat: 10:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-white text-base tracking-wide uppercase">
              Newsletter
            </h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Subscribe to get updates on new products &amp; offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center bg-white rounded-lg p-1 overflow-hidden shadow-inner">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent px-3 py-1.5 text-xs text-gray-800 focus:outline-none w-full"
                required
              />
              <button
                type="submit"
                className="bg-[#0A6C35] hover:bg-[#0D3B23] text-white p-2 rounded-md transition-colors shrink-0"
                title="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/70 gap-3">
          <p>© 2024 Panjatan Ayurveda, All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/policies" className="hover:text-white transition-colors">Terms &amp; Conditions</a>
            <span>•</span>
            <a href="/policies" className="hover:text-white transition-colors">Returns &amp; Refunds</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
