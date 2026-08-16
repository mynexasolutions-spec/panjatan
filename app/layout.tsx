import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { CustomerProvider } from "@/context/CustomerContext";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

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
    <html lang="en">
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
