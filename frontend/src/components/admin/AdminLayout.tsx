import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { Triangle } from 'lucide-react';
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
      <Toaster position="top-right" theme="dark" richColors closeButton />
      {/* 🏛️ Admin Navigation Shell */}
      <AdminSidebar />

      {/* 🎯 Main Content Area */}
      <main className="pl-64 min-h-screen flex flex-col">
        {/* Top Business Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-2xl z-50">
          <div className="flex items-center gap-10">
            {/* 🧭 High-Visibility Operational Nav */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/5">
              {[
                { name: 'Tour Packages', href: '/adminControl/tours' },
                { name: 'Bookings', href: '/adminControl/bookings' },
                { name: 'Customers', href: '/adminControl/customers' },
                { name: 'Leads & Inquiries', href: '/adminControl/leads' },
                { name: 'Payments', href: '/adminControl/financials' },
                { name: 'Content (CMS)', href: '/adminControl/cms' },
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-white font-bold text-sm tracking-tight">{session.user?.name}</span>
              <span className="text-blue-500 font-bold text-[9px] uppercase tracking-widest leading-none mt-0.5">
                Admin User
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-blue-600/30 p-0.5 shadow-2xl shadow-blue-600/20 transition-transform hover:scale-105 cursor-pointer ring-4 ring-black">
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
