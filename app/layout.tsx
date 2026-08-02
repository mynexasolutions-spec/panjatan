import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { CustomerProvider } from "@/context/CustomerContext";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--bricolage",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panjatan Ayurveda | Pure Ayurvedic Medicines for Healthy Living",
  description:
    "Panjatan Ayurveda provides safe, effective, and 100% natural Ayurvedic health products and herbal medicines manufactured in GMP & ISO certified facilities.",
  keywords: [
    "Panjatan Ayurveda",
    "Ayurvedic medicine",
    "Pachan Plus",
    "Digestive Care",
    "Herbal products India",
  ],
  openGraph: {
    title: "Panjatan Ayurveda | Pure Ayurvedic Medicines",
    description:
      "Safe, effective, and 100% natural Ayurvedic health products and herbal remedies.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${bricolage.variable}`}>
      <body className="font-body bg-cream text-ink antialiased">
        <SmoothScrollProvider>
          <ToastProvider>
            <CustomerProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </CustomerProvider>
          </ToastProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
