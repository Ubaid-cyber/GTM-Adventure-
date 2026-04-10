'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  CreditCard, 
  Settings, 
  ChevronRight,
  LogOut,
  Search,
  Plus,
  CalendarCheck,
  Inbox,
  FileText,
  Navigation,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: BarChart3, href: '/adminControl' },
  { name: 'Tour Packages', icon: MapPin, href: '/adminControl/tours' },
  { name: 'Bookings', icon: CalendarCheck, href: '/adminControl/bookings' },
  { name: 'Customers', icon: Users, href: '/adminControl/customers' },
  { name: 'Leads & Inquiries', icon: Inbox, href: '/adminControl/leads' },
  { name: 'Payments', icon: CreditCard, href: '/adminControl/financials' },
  { name: 'Content (CMS)', icon: FileText, href: '/adminControl/cms' },
  { name: 'Guides & Agents', icon: Navigation, href: '/adminControl/guides' },
  { name: 'Reviews & Ratings', icon: Star, href: '/adminControl/reviews' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 hidden lg:flex flex-col z-[100]">
      {/* 🏔️ Brand Area */}
      <div className="p-6 border-b border-white/5">
        <Link href="/adminControl" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-lg shadow-lg shadow-blue-600/20">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 text-white">
              <path d="M16 4L2 28H30L16 4Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-sm tracking-tight">GTM Administration</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Management HQ</span>
          </div>
        </Link>
      </div>

      {/* 🔍 Search Tools */}
      <div className="px-4 pt-6 pb-2">
        <div className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300
          ${searchFocused ? 'border-blue-500 bg-white/5 shadow-lg shadow-blue-500/10' : 'border-white/5 bg-white/[0.02]'}
        `}>
          <Search className={`w-4 h-4 ${searchFocused ? 'text-blue-500' : 'text-white/20'}`} />
          <input 
            type="text" 
            placeholder="Search dashboard..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent border-none text-xs text-white placeholder:text-white/20 focus:ring-0 w-full"
          />
          {!searchFocused && <span className="text-white/10 text-[10px] px-1 border border-white/10 rounded">/</span>}
        </div>
      </div>

      {/* 🧭 Professional Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-white/20 text-[10px] uppercase font-bold tracking-widest px-4 mb-2">Core Operations</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                ${isActive ? 'bg-blue-600/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'}
              `}>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r-full"
                  />
                )}
                <item.icon className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-500' : 'group-hover:scale-110'}`} />
                <span className="text-[13px] font-medium leading-none">{item.name}</span>
                {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-blue-500/50" />}
              </div>
            </Link>
          );
        })}

        {/* ➕ Quick Actions Group */}
        <div className="mt-8 pt-4 border-t border-white/5">
          <div className="text-white/20 text-[10px] uppercase font-bold tracking-widest px-4 mb-2">Quick Actions</div>
          <Link href="/adminControl/tours/new" className="w-full flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-white hover:bg-white/[0.02] rounded-xl transition-all group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span className="text-[13px] font-medium leading-none">New Trek</span>
          </Link>
        </div>
      </nav>

      {/* 🚪 System Actions */}
      <div className="p-4 border-t border-white/5 space-y-1 bg-black/20">
        <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-white hover:bg-white/[0.02] rounded-xl transition-all">
          <Settings className="w-4 h-4" />
          <span className="text-[13px] font-medium">Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all">
          <LogOut className="w-4 h-4" />
          <span className="text-[13px] font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
