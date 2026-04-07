import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import JsonLd from "@/components/seo/JsonLd";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://gtmadventures.com/'),
  title: {
    default: "GTM Adventures | Elite Global Expeditions & Adventure Booking",
    template: "%s | GTM Adventures",
  },
  description: "Premier global expeditions with world-class safety protocols. Book elite adventure treks and high-altitude missions led by expert guides and supported by our Mission Control.",
  keywords: ["Elite Expeditions", "World-Class Adventure", "Global Trekking", "High-Altitude Safety", "GTM Adventures", "Adventure Discovery", "Secure Expedition Management", "Professional Mountain Guides"],
  authors: [{ name: "GTM Adventures Team" }],
  creator: "GTM Adventures",
  publisher: "GTM Adventures",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GTM Adventures | Elite Himalayan Trek Booking",
    description: "Premier Himalayan treks with world-class safety protocols. Experience the ultimate adventure in Nepal, India, and Bhutan.",
    url: "https://gtmadventures.com",
    siteName: "GTM Adventures",
    images: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200&h=630",
        width: 1200,
        height: 630,
        alt: "GTM Adventures Himalayan Peak",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GTM Adventures | Elite Himalayan Trek Booking",
    description: "Premier Himalayan treks with world-class safety protocols. Join us in the Himalayas.",
    images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200&h=630"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a]`}>
        <AuthProvider>
          <JsonLd />
          <div className="w-full overflow-x-hidden relative min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
