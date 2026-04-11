import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse, ChevronRight } from 'lucide-react';
import MedicalLogoutButton from '@/components/medical/MedicalLogoutButton';

export default async function MedicalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== 'MEDICAL') {
    redirect('/login');
  }

  const user = (session as any).user;
  const name: string = user?.name ?? 'Medical HQ';
  const parts = name.trim().split(/\s+/);
  const initials =
    (parts[0]?.[0] ?? '').toUpperCase() +
    (parts.length > 1 ? (parts[parts.length - 1][0] ?? '').toUpperCase() : '');
  const image: string | undefined = user?.image;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* ── Top Navigation Bar ── */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-[200] shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <HeartPulse className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold text-gray-900 tracking-tight">Medical Review</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">GTM Adventures</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-semibold">Medical HQ</span>
        </nav>

        {/* User + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right leading-none gap-0.5">
            <span className="text-sm font-semibold text-gray-900">{name}</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Medical Officer</span>
          </div>
          {/* Avatar — rendered server-side */}
          {image ? (
            <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black select-none ring-2 ring-blue-100">
              {initials}
            </div>
          )}
          {/* Client-side logout button */}
          <MedicalLogoutButton />
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* ── Minimal Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-4 px-6 lg:px-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-medium">
            © {new Date().getFullYear()} GTM Adventures · Medical Review System
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] text-gray-400 font-medium">System Operational</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
