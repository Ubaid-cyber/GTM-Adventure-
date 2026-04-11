'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, BarChart3, MapPin, Users, CreditCard, 
  CalendarCheck, Inbox, FileText, Navigation, Star, 
  LogOut, Plus, ChevronRight, LayoutDashboard,
  Settings, User
} from 'lucide-react';
import { handleSignOut } from '@/components/layout/LogoutButton';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: BarChart3, href: '/adminControl', desc: 'Performance & Overview' },
  { name: 'Tour Packages', icon: MapPin, href: '/adminControl/tours', desc: 'Inventory Management' },
  { name: 'Bookings', icon: CalendarCheck, href: '/adminControl/bookings', desc: 'Reservation Flow' },
  { name: 'Customers', icon: Users, href: '/adminControl/customers', desc: 'User Directory' },
  { name: 'Financials', icon: CreditCard, href: '/adminControl/financials', desc: 'Payments & Revenue' },
  { name: 'Leads', icon: Inbox, href: '/adminControl/leads', desc: 'Inquiries & CRM' },
  { name: 'Content (CMS)', icon: FileText, href: '/adminControl/cms', desc: 'Site Administration' },
  { name: 'Guides', icon: Navigation, href: '/adminControl/guides', desc: 'Staff Assignments' },
  { name: 'Reviews', icon: Star, href: '/adminControl/reviews', desc: 'Feedback Management' },
];

export default function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Stable scroll lock with scrollbar compensation
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  return (
    <div className="lg:hidden" style={{ isolation: 'isolate' }}>
      {/* Hamburger Trigger */}
      <button
        onClick={toggle}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-white transition-all active:scale-90"
        aria-label="Toggle Admin Menu"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999998]"
            />

            {/* Right Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-white/5 z-[999999] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                     <LayoutDashboard size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight leading-none">Admin Panel</p>
                    <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mt-0.5">Control Center</p>
                  </div>
                </div>
                <button 
                  onClick={close} 
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em] px-2 mb-4 italic">Operations Console</p>
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
                        <div className="flex items-center gap-3.5">
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

                <div className="mt-8 pt-6 border-t border-white/5">
                   <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em] px-2 mb-4 italic">Quick Launch</p>
                   <Link
                      href="/adminControl/tours/new"
                      onClick={close}
                      className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group transition-all hover:bg-white/[0.05]"
                    >
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={18} className="text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm leading-none">New Tour Package</p>
                        <p className="text-white/30 text-[10px] mt-1">Initialize direct inventory</p>
                      </div>
                      <ChevronRight size={14} className="text-white/10 group-hover:text-white/30" />
                    </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 space-y-2 bg-black/40">
                <Link href="/dashboard/profile" onClick={close} className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-bold">Public Profile</span>
                </Link>
                <button
                  onClick={() => { close(); handleSignOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-bold tracking-tight">Deactivate Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
