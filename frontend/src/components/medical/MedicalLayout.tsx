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
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ isolation: 'isolate' }}>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      {/* 🏥 Medical Sidebar Shell */}
      <MedicalSidebar />

      {/* 🎯 Main Medical Dashboard Area */}
      <main className="lg:pl-64 min-h-screen flex flex-col">
        {/* Top Clinical Header */}
        <header 
          className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-2xl z-50"
          style={{ isolation: 'isolate' }}
        >
          <div className="flex items-center gap-10">
            {/* 🧭 Operational Status Nav */}
            <div className="hidden lg:flex items-center gap-2 bg-blue-600/5 px-4 py-1.5 rounded-full border border-blue-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Clinical Node Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <MedicalMobileMenu />
            
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-white font-bold text-sm tracking-tight capitalize">
                {user?.name || user?.email?.split('@')[0] || 'Medical Officer'}
              </span>
              <span className="text-blue-500 font-bold text-[9px] uppercase tracking-widest leading-none mt-0.5 italic">
                {isMedical ? 'Medical Officer' : 'HQ Admin (Override)'}
              </span>
            </div>

            {/* Avatar Initials */}
            <div className="w-10 h-10 rounded-full border-2 border-blue-600/30 shadow-2xl shadow-blue-600/20 transition-transform hover:scale-105 cursor-pointer ring-4 ring-black overflow-hidden flex items-center justify-center bg-blue-600">
              {user?.image ? (
                <img src={user.image} alt="Officer" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-sm tracking-tight select-none">
                  {isMedical ? 'M' : 'A'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* 🏔️ Core Medical Page Content */}
        <section className="flex-1 p-8 bg-gradient-to-br from-transparent via-[#0a0a0a] to-blue-900/5">
          {children}
        </section>
      </main>
    </div>
  );
}
