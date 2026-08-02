"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins exactly once, client-side only.
if (typeof window !== "undefined" && !(gsap as any).__scrollTriggerRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  (gsap as any).__scrollTriggerRegistered = true;
}

export { gsap, ScrollTrigger };
