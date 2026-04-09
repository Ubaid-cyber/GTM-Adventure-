'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  ShieldAlert, 
  CreditCard, 
  History, 
  Settings, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
  { name: 'Expeditions', icon: Map, href: '/dashboard/admin/expeditions' },
  { name: 'Participants', icon: Users, href: '/dashboard/admin/participants' },
  { name: 'Medical HQ', icon: ShieldAlert, href: '/dashboard/admin/medical' },
  { name: 'Financials', icon: CreditCard, href: '/dashboard/admin/financials' },
  { name: 'Audit Logs', icon: History, href: '/dashboard/admin/audit' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex flex-col z-[100]">

      {/* HQ Logo Area */}
      <div className="p-6 border-b border-border">

        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded-lg shadow-lg shadow-[#1e3a8a]/20">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 text-white">
              <path d="M16 4L2 28H30L16 4Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-tight">GTM HQ</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Command Center</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive ? 'bg-surface text-foreground' : 'text-muted hover:text-foreground'}
              `}>

                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-[#1e3a8a] rounded-r-full"
                  />
                )}
                <item.icon className={`w-5 h-5 group-hover:scale-110 transition-transform ${isActive ? 'text-primary' : ''}`} />
                <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                {isActive && <ChevronRight className="ml-auto w-4 h-4 text-muted/50" />}

              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-muted hover:text-foreground hover:bg-surface rounded-xl transition-all">

          <Settings className="w-5 h-5" />
          <span className="text-sm font-semibold">Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Exit HQ</span>
        </button>
      </div>
    </aside>
  );
}
