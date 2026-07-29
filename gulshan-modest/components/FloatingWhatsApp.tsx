"use client";

import { IconWhatsapp } from "./Icons";
import { SITE } from "@/lib/data";

export default function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
        SITE.whatsappMessage
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Gulshan Modest on WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-40 h-14 w-14 md:h-16 md:w-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(37,211,102,0.55)] hover:scale-105 transition-transform"
    >
      <IconWhatsapp className="w-7 h-7 md:w-8 md:h-8" />
    </a>
  );
}
