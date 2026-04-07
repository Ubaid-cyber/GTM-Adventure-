import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="w-full overflow-x-hidden relative min-h-screen pt-16">
        {children}
      </div>
      <Footer />
    </>
  );
}
