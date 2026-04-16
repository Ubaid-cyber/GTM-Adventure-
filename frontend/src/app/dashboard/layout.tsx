import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PanelHeader from '@/components/layout/PanelHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // 🛡️ AUTH GUARD: Required for all dashboard routes
  if (!session || !session.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;

  // 🏔️ TREKKER VIEW: Users see standard site navigation for their private pages
  if (role === 'TREKKER') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full overflow-x-hidden relative pt-16">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 🛡️ COMMAND CENTER GUARD: Only staff/admins access management tools
  const isStaff = role === 'LEADER' || role === 'ADMIN' || role === 'MEDICAL';
  if (!isStaff) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PanelHeader role={role as any} userName={session.user.name || undefined} />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        {children}
      </main>
    </div>
  );
}
