# Gulshan Modest — Landing Page

A Next.js 14 (App Router) landing page for **Gulshan Modest**, built with TypeScript and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
app/
  layout.tsx      → fonts (Plus Jakarta Sans + Bricolage Grotesque), metadata
  page.tsx         → assembles every section
  globals.css      → tokens, scroll-reveal, dividers, gradients
components/
  Header.tsx       → sticky nav + mobile hamburger menu
  Hero.tsx         → hero section with animated line-art + floating product images
  HeroLineArt.tsx  → animated SVG echo of the logo's tulip/swirl motif
  TrustMarquee.tsx → scrolling trust-signal strip
  Story.tsx        → brand story / about section
  Categories.tsx   → shop-by-category grid (2 cols on mobile, 4 on desktop)
  Products.tsx     → featured product grid + WhatsApp "Enquire" CTA per card
  WhyUs.tsx        → USP section on dark emerald background
  Lookbook.tsx     → community styling gallery
  Testimonials.tsx → customer reviews
  Contact.tsx      → contact cards + enquiry form that opens WhatsApp pre-filled
  Footer.tsx       → footer with nav + contact recap
  BotanicalDivider.tsx → signature scroll-drawn divider between sections
  Icons.tsx        → line-art icon set (no emojis), matches the logo's stroke style
  FloatingWhatsApp.tsx → fixed WhatsApp button
lib/
  data.ts          → all copy, products, categories, testimonials — edit here first
public/
  logo.png         → your logo, background already made transparent
```

## Editing content

Almost everything you'll want to change — product names, prices, categories,
testimonials, contact details, nav links — lives in **`lib/data.ts`**. Edit
that file rather than the components themselves where possible.

## About the product photography

The Google Drive folder you shared could not be read directly by the
assistant that generated this project (Drive folders require a signed-in
session and aren't fetchable as a plain URL). The product and lifestyle
images currently wired into `lib/data.ts` are **placeholder stock photography
from Unsplash**, chosen to match the modest-fashion category and the logo's
cream / emerald / bronze palette.

To swap in your real product photography:

1. Drop your images into `public/products/` (create the folder).
2. In `lib/data.ts`, change each `image:` value from the Unsplash URL to
   `"/products/your-file-name.jpg"`.
3. If your images come from another external host, add that hostname to
   `images.remotePatterns` in `next.config.js` (Unsplash is already
   allow-listed there).

## Design tokens

Colors, fonts and animation timing are centralized in `tailwind.config.js`
under `theme.extend`. The palette (`cream`, `emerald`, `gold`, `rose`, `ink`)
was derived from the brand mark you provided.

## Deploying

This is a standard Next.js app — it deploys as-is to Vercel, Netlify, or any
Node host. Run `npm run build` then `npm run start`, or connect the repo to
your hosting provider of choice.
