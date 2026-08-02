"use client";

import { useLayoutEffect, useRef, ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const DELAY_SECONDS: Record<number, number> = { 0: 0, 1: 0.08, 2: 0.16, 3: 0.24, 4: 0.32 };

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3 | 4;
  as?: any;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fromVars = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 52, scale: 0.96 };
    const toVars = prefersReducedMotion
      ? { opacity: 1, duration: 0.4, delay: DELAY_SECONDS[delay] }
      : { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out", delay: DELAY_SECONDS[delay] };

    // Directly tween the node with GSAP rather than toggling a CSS class +
    // relying on a CSS transition to pick it up — more reliable across
    // browsers/timing than the class-toggle approach.
    gsap.set(node, fromVars);
    const trigger = ScrollTrigger.create({
      trigger: node,
      start: "top 88%",
      once: true,
      onEnter: () => {
        node.classList.add("is-visible");
        gsap.to(node, toVars);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
