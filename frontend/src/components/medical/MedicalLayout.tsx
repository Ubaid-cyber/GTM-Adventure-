import React from 'react';
import { auth } from '@/lib/auth';
import { Toaster } from 'sonner';
import MedicalSidebar from './MedicalSidebar';
import MedicalLoginGate from './MedicalLoginGate';
import MedicalMobileMenu from './MedicalMobileMenu';

interface MedicalLayoutProps {
  children: React.ReactNode;
}

export default async function MedicalLayout({ children }: MedicalLayoutProps) {
  const session = await auth();

  // 🛡️ Dedicated Medical Security Perimeter
  // Re-enable 2FA by adding role checks here if needed.
  if (!session || ((session.user as any)?.role !== 'MEDICAL' && (session.user as any)?.role !== 'ADMIN')) {
    return <MedicalLoginGate />;
  }

  const user = session.user;
  const isMedical = (user as any)?.role === 'MEDICAL';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      {/* 🧭 Ultra-Minimal Medical Command Header */}
      <PanelHeader role={(user as any)?.role} userName={user?.name || undefined} />

      {/* 🎯 Main Medical Dashboard Area */}
      <main className="min-h-screen flex flex-col">
        {/* 🏔️ Core Medical Page Content */}
        <section className="flex-1 p-8 bg-gradient-to-br from-transparent via-[#0a0a0a] to-blue-900/5 max-w-[1600px] mx-auto w-full">
          {children}
        </section>
      </main>
    </div>
  );
}
