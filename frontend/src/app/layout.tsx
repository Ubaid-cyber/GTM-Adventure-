import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ShieldAlert } from "lucide-react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import JsonLd from "@/components/seo/JsonLd";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://gtmadventures.com'),
  title: {
    default: "GTM Adventures | Elite Global Expeditions & Adventure Booking",
    template: "%s | GTM Adventures",
  },
  description: "Premier global treks with world-class safety protocols. Book elite adventure trips and high-altitude trips led by expert guides and supported by our HQ Team.",
  keywords: ["Elite Treks", "Himalayan Expeditions", "Everest Base Camp Booking", "Professional Mountain Guides", "GTM Adventures", "High-Altitude Safety", "Adventure Travel"],
  authors: [{ name: "GTM Adventures Team" }],
  creator: "GTM Adventures",
  publisher: "GTM Adventures",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://gtmadventures.com",
    languages: {
      'en-US': '/en-US',
    },
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // 🛡️ Aegis Shield Integration (Global IP Filter)
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || '0.0.0.0';
  
  let isBlocked = false;
  if (redis) {
    try {
      const blockValue = await redis.get(`blocked_ip:${ip}`);
      isBlocked = !!blockValue;
    } catch (e) {
      console.error('[Shield] Safety Check Bypass (Fail-Open):', e);
    }
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a]`}>
        {isBlocked ? (
          <div className="bg-[#050505] text-white flex items-center justify-center min-h-screen p-8 text-center font-sans tracking-tight fixed inset-0 z-[9999]">
            <div className="max-w-md space-y-6 animate-in fade-in zoom-in duration-1000">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-500/20 shadow-2xl shadow-rose-500/10 rotate-12">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-[0.15em] italic italic-primary">Access <span className="text-rose-500">Denied</span></h1>
              <p className="text-white/40 text-sm leading-relaxed font-medium">
                Your source address (<span className="text-white font-mono text-xs">{ip}</span>) has been permanently restricted by GTM Security HQ. 
              </p>
              <div className="pt-10 border-t border-white/5">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Protocol Code: Aegis-Lockdown-403</p>
                <p className="text-[9px] text-white/10 mt-2">GTM ADVENTURES SECURITY INFRASTRUCTURE</p>
              </div>
            </div>
          </div>
        ) : (
          <AuthProvider>
            <JsonLd />
            <div className="w-full overflow-x-hidden relative min-h-screen">
              {children}
            </div>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
