import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';
import AdminLoginGate from './AdminLoginGate';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // 🛡️ Dedicated Admin Security Perimeter
  // If no session exists, OR if their current session is lacking ADMIN clearance, force the Admin Login Gate
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return <AdminLoginGate />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 🏛️ Admin Navigation Shell */}
      <AdminSidebar />

      {/* 🎯 Main Content Area */}
      <main className="pl-64 min-h-screen flex flex-col">
        {/* Top Business Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-3xl z-50">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">System Status: Active</span>
              </div>
              <p className="text-white font-bold text-sm">Administration Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-white font-bold text-sm tracking-tight">{session.user?.name}</span>
              <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest">
                System Administrator
              </span>
            </div>
            <div className="w-9 h-9 rounded-full border border-blue-600/30 p-0.5 shadow-lg shadow-blue-600/10 transition-transform hover:scale-105 cursor-pointer">
              <img 
                src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name || 'Admin'}&background=2563eb&color=fff`} 
                alt="Account" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </header>

        {/* 🏔️ Core Page Content */}
        <section className="flex-1 p-8 bg-gradient-to-br from-transparent via-[#0a0a0a] to-blue-900/5">
          {children}
        </section>
      </main>
    </div>
  );
}
