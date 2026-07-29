"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Signature element: a continuous-line tulip motif echoing the wordmark,
 * used as a section divider. Draws itself in on scroll using stroke-dashoffset.
 */
export default function BotanicalDivider({
  flip = false,
  tone = "emerald",
}: {
  flip?: boolean;
  tone?: "emerald" | "gold";
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  const stroke = tone === "gold" ? "#B9893F" : "#1E3B2E";

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="w-full flex items-center justify-center py-2 md:py-4"
      aria-hidden="true"
    >
      <svg
        ref={ref}
        viewBox="0 0 600 60"
        className={`w-full max-w-[420px] h-10 md:h-12 ${flip ? "scale-x-[-1]" : ""}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 30 C 90 30, 110 8, 150 8 C 175 8, 185 22, 175 32 C 165 42, 145 36, 150 22 M150 22 C 155 10, 175 4, 195 14 C 230 32, 260 30, 300 30 C 340 30, 370 32, 405 14 C 425 4, 445 10, 450 22 C 455 36, 435 42, 425 32 C 415 22, 425 8, 450 8 C 490 8, 510 30, 590 30"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1000}
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: visible ? 0 : 1000,
            transition: "stroke-dashoffset 1.8s cubic-bezier(.22,1,.36,1)",
          }}
        />
        <circle
          cx="300"
          cy="30"
          r="3.5"
          fill={stroke}
          opacity={visible ? 1 : 0}
          style={{ transition: "opacity 0.4s ease 1.6s" }}
        />
      </svg>
    </div>
  );
}
