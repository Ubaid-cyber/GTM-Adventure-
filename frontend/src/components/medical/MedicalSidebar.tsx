'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Stethoscope, 
  Activity, 
  Users, 
  FileText, 
  History, 
  Home, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { handleSignOut } from '@/components/layout/LogoutButton';

const NAV_ITEMS = [
  { name: 'Health Status', icon: Activity, href: '/medicalControl', desc: 'Real-time Vitals' },
  { name: 'Clearance Queue', icon: Stethoscope, href: '/medicalControl/clearance', desc: 'Pre-flight Approvals' },
  { name: 'Trekker Profiles', icon: Users, href: '/medicalControl/profiles', desc: 'Health Records' },
  { name: 'Incident Reports', icon: AlertCircle, href: '/medicalControl/incidents', desc: 'Logs & Issues' },
  { name: 'Health Archive', icon: History, href: '/medicalControl/archive', desc: 'Past Expeditions' },
];

export default function MedicalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex-col z-[100] shadow-2xl">
      {/* 🏥 Branding Section */}
      <div className="p-8 border-b border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 transition-all group-hover:bg-blue-600/10"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40 transform -rotate-3 transition-transform group-hover:rotate-0">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <div className="mt-5">
            <h2 className="text-white font-black text-sm tracking-widest uppercase leading-none">Medical Panel</h2>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Health & Safety First</p>
          </div>
        </div>
      </div>

      {/* 🧭 Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-2">
        <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.35em] mb-6 px-2 italic">Standard Panel</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${
                isActive
                  ? 'bg-blue-600/10 border border-blue-500/20'
                  : 'hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-white/[0.03] text-white/40 group-hover:text-white group-hover:bg-white/10'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-bold text-xs transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-white/20 mt-1 font-medium">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-all ${isActive ? 'text-blue-500 opacity-100' : 'text-white/10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
            </Link>
          );
        })}

        <div className="mt-10 pt-8 border-t border-white/5">
          <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.35em] mb-6 px-2 italic">General</p>
          <Link
            href="/"
            className="flex items-center gap-4 p-4 hover:bg-white/[0.03] rounded-2xl transition-all border border-transparent hover:border-white/5 group"
          >
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white/40 group-hover:text-white/60">Main Portal</span>
          </Link>
        </div>
      </nav>

      {/* 🔐 Control Footer */}
      <div className="p-6 border-t border-white/5 bg-black/40">
        <button
          onClick={() => handleSignOut()}
          className="w-full flex items-center gap-4 p-4 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20 group"
        >
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold">End Session</p>
            <p className="text-[10px] text-rose-500/40 uppercase tracking-widest mt-0.5">Secure Logout</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
