"use client";

import { useEffect, useState } from "react";

/**
 * Large-scale echo of the logo's continuous swirl line, drawn in on page load.
 * This is the page's signature motif, reused (smaller) as section dividers.
 */
export default function HeroLineArt({ className = "" }: { className?: string }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg
      viewBox="0 0 500 560"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* tulip bloom */}
      <path
        d="M250 60c22 22 30 46 28 70-24 8-48 0-62-18-6 32 4 64 34 80"
        stroke="#1E3B2E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1000}
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: drawn ? 0 : 1000,
          transition: "stroke-dashoffset 2.2s cubic-bezier(.22,1,.36,1)",
        }}
      />
      <path
        d="M250 60c-22 22-30 46-28 70 24 8 48 0 62-18"
        stroke="#1E3B2E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1000}
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: drawn ? 0 : 1000,
          transition: "stroke-dashoffset 2.2s cubic-bezier(.22,1,.36,1) 0.2s",
        }}
      />
      {/* stem */}
      <path
        d="M250 130v160"
        stroke="#1E3B2E"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={1000}
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: drawn ? 0 : 1000,
          transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1) 0.5s",
        }}
      />
      {/* sweeping wing / flame swirl, echoing logo */}
      <path
        d="M330 110c40-30 70-55 95-95M345 140c50-26 90-58 120-105M250 300c40 18 80 14 115-14 45-36 95-26 130 8-30-2-60 10-72 36-14 30 10 56 38 50"
        stroke="#B9893F"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1000}
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: drawn ? 0 : 1000,
          transition: "stroke-dashoffset 2.6s cubic-bezier(.22,1,.36,1) 0.7s",
        }}
      />
      {/* base swoosh, echoing logo underline */}
      <path
        d="M70 420c70 38 160 46 230 18 60-24 110-20 150 10"
        stroke="#1E3B2E"
        strokeWidth="6"
        strokeLinecap="round"
        pathLength={1000}
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: drawn ? 0 : 1000,
          transition: "stroke-dashoffset 2s cubic-bezier(.22,1,.36,1) 1.1s",
        }}
      />
      <circle
        cx="250"
        cy="300"
        r="4"
        fill="#B9893F"
        opacity={drawn ? 1 : 0}
        style={{ transition: "opacity 0.5s ease 1.6s" }}
      />
    </svg>
  );
}
