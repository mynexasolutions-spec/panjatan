/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F8F6F0",
        "cream-deep": "#EFECE4",
        "cream-line": "#E2DDD2",
        ink: "#1C2D23",
        emerald: {
          DEFAULT: "#0A6C35",
          soft: "#138846",
          deep: "#0B301B",
          dark: "#062212",
        },
        ayurveda: {
          green: "#0A6C35",
          dark: "#0D3B23",
          deep: "#0B301B",
          light: "#EBF5ED",
          accent: "#2D8A52",
          gold: "#D4AF37",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F3E5AB",
          pale: "#FAF4D3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        wrap: "1400px",
      },
      boxShadow: {
        soft: "0 20px 50px -20px rgba(10, 108, 53, 0.15)",
        card: "0 10px 30px -10px rgba(13, 59, 35, 0.12)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.9s cubic-bezier(.22,1,.36,1) forwards",
        shimmer: "shimmer 6s ease-in-out infinite alternate",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

