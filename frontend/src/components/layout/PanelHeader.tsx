'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Mountain, LogOut, User, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleSignOut } from '@/components/layout/LogoutButton';

interface PanelHeaderProps {
  role: 'LEADER' | 'MEDICAL' | 'ADMIN';
  userName?: string;
}

export default function PanelHeader({ role, userName }: PanelHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const isLeader = role === 'LEADER' || (role === 'ADMIN' && pathname.includes('/dashboard'));
  const isMedical = role === 'MEDICAL' || (role === 'ADMIN' && pathname.includes('/medicalControl'));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // Append search to current URL
      const params = new URLSearchParams(window.location.search);
      params.set('q', search);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex items-center h-20 gap-8">
          
          {/* 🏁 LEFT: BRAND */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-slate-900/10">
              <Mountain size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-sm uppercase tracking-tighter leading-none italic">
                GTM <span className="text-blue-600">Adventure</span>
              </span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-1 leading-none">
                {role === 'MEDICAL' ? 'Medical Operations' : 'Staff Command'}
              </span>
            </div>
          </Link>

          {/* 🔍 CENTER: SEARCHBAR */}
          <div className="flex-1 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search participants, records, or expeditions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:border-blue-600/30 focus:shadow-xl transition-all"
              />
            </form>
          </div>

          {/* 🔘 RIGHT: NAVIGATION LINKS */}
          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
             
             {isLeader ? (
               <>
                 <Link 
                   href="/dashboard/participants" 
                   className="hidden lg:flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
                 >
                   My participants
                 </Link>
                 <Link 
                   href="/dashboard" 
                   className="flex items-center gap-2 text-[11px] font-black text-white bg-slate-900 px-6 py-2.5 rounded-xl uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                 >
                   Leader console
                 </Link>
               </>
             ) : (
               <Link 
                 href="/medicalControl" 
                 className="flex items-center gap-2 text-[11px] font-black text-white bg-blue-600 px-6 py-2.5 rounded-xl uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
               >
                 <ShieldCheck size={14} className="text-white/80" />
                 Medical panel
               </Link>
             )}

             <div className="h-6 w-px bg-slate-100 mx-2 hidden md:block" />

             {/* IDENTITY PORTAL */}
             <div className="relative group/user">
                <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">
                    {userName ? userName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</span>
                    <span className="text-xs font-bold text-slate-900 tracking-tight leading-none">{userName || 'Staff Member'}</span>
                  </div>
                </button>

                {/* DROPDOWN MENU */}
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-900/10 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all translate-y-2 group-hover/user:translate-y-0 p-2 z-[101]">
                   <p className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">Operator Control</p>
                   <button 
                     onClick={handleSignOut}
                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors group/logout"
                   >
                     <LogOut size={16} className="group-hover/logout:-translate-x-1 transition-transform" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                   </button>
                </div>
             </div>

          </div>
        </div>
      </div>
    </header>
  );
}
