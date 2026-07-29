"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import type { NavigationLink, SiteSettings } from "@/lib/cms";
import { subscribeToNewsletter } from "@/actions/newsletter";

export default function FooterClient({ settings, footerLinks, legalLinks }: { settings: SiteSettings; footerLinks: NavigationLink[]; legalLinks: NavigationLink[] }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      const result = await subscribeToNewsletter(email);
      setMessage(result.success ? "Thank you for subscribing!" : (result.error || "Unable to subscribe."));
      if (result.success) setEmail("");
    }
  };

  return (
    <footer className="bg-[#0B301B] text-white pt-14 md:pt-16 pb-8 border-t border-emerald-950">
      <div className="max-w-wrap mx-auto px-4 md:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-emerald-800/60">
          
          {/* Column 1: Brand Info (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="/">
              <Image
                src="/panjatan-logo.jpeg"
                alt={settings.site_name}
                width={160}
                height={50}
                className="h-10 md:h-12 w-auto object-contain bg-white rounded-lg px-2 py-1"
              />
            </a>

            <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed max-w-sm">
              {settings.tagline}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.facebook_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.instagram_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.youtube_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-800/60 hover:bg-emerald-600 text-emerald-100 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-white text-base tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-y-2 text-xs md:text-sm font-medium text-emerald-100/80">
              {footerLinks.map((link) => (
                <li key={link.id || `${link.location}-${link.href}`}>
                  <a href={link.href} target={link.is_external ? "_blank" : undefined} rel={link.is_external ? "noreferrer" : undefined} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-white text-base tracking-wide uppercase">
              Policies
            </h4>
            <ul className="flex flex-col gap-y-2 text-xs md:text-sm font-medium text-emerald-100/80">
              {legalLinks.map((link) => (
                <li key={link.id || `${link.location}-${link.href}`}>
                  <a href={link.href} target={link.is_external ? "_blank" : undefined} rel={link.is_external ? "noreferrer" : undefined} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Care (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-white text-base tracking-wide uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-emerald-100/80">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.support_phone.replace(/\D/g, "")}`} className="hover:text-white">{settings.support_phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${settings.support_email}`} className="hover:text-white">{settings.support_email}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.business_hours}</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter (lg:col-span-2) */}
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
            {message && <p className="text-[11px] text-emerald-100" role="status">{message}</p>}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex items-center justify-center text-center text-xs text-emerald-200/70">
          <p>© {new Date().getFullYear()} {settings.site_name}, All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
}
