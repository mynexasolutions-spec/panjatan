"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // Admin dashboard scrolls its own internal panes (not the window), and
    // Lenis hijacks wheel events on the document to drive window scrolling.
    // That breaks mouse-wheel scrolling inside the admin UI, so skip it there.
    if (isAdmin) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    // Keep GSAP's ScrollTrigger in sync with Lenis' virtual scroll position.
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Smoothly scroll to in-page anchors (e.g. href="#categories") via Lenis
    // instead of the native jump, since native scroll-behavior is disabled
    // globally while Lenis is active (see globals.css).
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -110, duration: 1.2 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [isAdmin]);

  return <>{children}</>;
}
