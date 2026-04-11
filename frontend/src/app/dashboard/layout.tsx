import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PanelHeader from '@/components/layout/PanelHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // 🛡️ REVERSE GUARD: Ensure only authorized roles access the command center
  if (!session || !session.user) {
    redirect('/login');
  }

  const role = (session.user as any).role as 'LEADER' | 'MEDICAL' | 'ADMIN';
  if (role !== 'LEADER' && role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PanelHeader role={role} userName={session.user.name || undefined} />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        {children}
      </main>
    </div>
  );
}
