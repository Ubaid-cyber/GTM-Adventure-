'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Stethoscope, Activity, Users, AlertCircle, 
  History, Home, LogOut, ChevronRight, LayoutDashboard, Plus
} from 'lucide-react';
import { handleSignOut } from '@/components/layout/LogoutButton';

const NAV_ITEMS = [
  { name: 'Health Status', icon: Activity, href: '/medicalControl', desc: 'Real-time Vitals' },
  { name: 'Clearance Queue', icon: Stethoscope, href: '/medicalControl/clearance', desc: 'Pre-flight Approvals' },
  { name: 'Trekker Profiles', icon: Users, href: '/medicalControl/profiles', desc: 'Health Records' },
  { name: 'Incident Logs', icon: AlertCircle, href: '/medicalControl/incidents', desc: 'Logs & Issues' },
  { name: 'Health Archive', icon: History, href: '/medicalControl/archive', desc: 'Past Records' },
];

export default function MedicalMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  return (
    <div className="lg:hidden" style={{ isolation: 'isolate' }}>
      <button
        onClick={toggle}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:text-blue-400 transition-all active:scale-90"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999998]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-white/5 z-[999999] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                     <Stethoscope size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight leading-none">Medical Panel</p>
                    <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mt-0.5">Operations</p>
                  </div>
                </div>
                <button onClick={close} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em] px-2 mb-4 italic">Navigation</p>
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={close}
                        className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${
                          isActive
                            ? 'bg-blue-600/10 border border-blue-500/20'
                            : 'hover:bg-white/[0.02] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-white/[0.03] text-white/40 group-hover:text-white group-hover:bg-white/10'
                          }`}>
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className={`font-bold text-sm leading-none transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-white/20 mt-1 font-medium">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-all ${isActive ? 'text-blue-500 opacity-100' : 'text-white/10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-white/5 space-y-2 bg-black/40">
                <Link href="/" onClick={close} className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-bold">Return Home</span>
                </Link>
                <button
                  onClick={() => { close(); handleSignOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-bold tracking-tight">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
