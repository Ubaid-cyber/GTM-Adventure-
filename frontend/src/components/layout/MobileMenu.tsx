'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Compass, Info, Image as ImageIcon,
  CalendarCheck, Heart, User, Shield, LogOut, ChevronRight,
  Mountain, Stethoscope
} from 'lucide-react';
import { Session } from 'next-auth';
import { handleSignOut } from '@/components/layout/LogoutButton';

interface MobileMenuProps {
  session: Session | null;
}

const PUBLIC_LINKS = [
  { label: 'Tour Packages', href: '/treks', icon: Compass, desc: 'Explore all adventures' },
  { label: 'About Us', href: '/about', icon: Info, desc: 'Our story & mission' },
  { label: 'Gallery', href: '/gallery', icon: ImageIcon, desc: 'Photos from the trails' },
];

const DASHBOARD_LINKS = [
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck, desc: 'View your reservations' },
  { label: 'Health Form', href: '/dashboard/health', icon: Heart, desc: 'Medical clearance' },
  { label: 'My Profile', href: '/dashboard/profile', icon: User, desc: 'Account settings' },
];

export default function MobileMenu({ session }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'ADMIN';
  const isMedical = userRole === 'MEDICAL';
  const firstName = session?.user?.name?.split(' ')[0] || 'Adventurer';

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden" style={{ isolation: 'isolate' }}>
      {/* 🍔 Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={22} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 🌑 Backdrop (Blur + Dim) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[999998]"
            />

            {/* 🛸 Floating Panel ( */}
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-16 left-4 right-4 max-h-[80vh] bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[999999] flex flex-col overflow-hidden border border-slate-100 sm:left-auto sm:right-6 sm:w-72"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🏁 Header within Panel */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <Mountain size={14} />
                  </div>
                  <span className="font-black text-slate-900 text-xs uppercase tracking-widest">Navigation</span>
                </div>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 📜 Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-4">
                  
                  {/* 👋 Identity (if logged in) */}
                  {isLoggedIn && (
                    <div className="px-2 py-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        {firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Account</p>
                        <p className="text-slate-900 font-black text-sm capitalize">{firstName} 👋</p>
                      </div>
                    </div>
                  )}

                  {/* 🧭 Public Links */}
                  <div>
                    <div className="space-y-1">
                      {PUBLIC_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={close}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                              <link.icon size={14} />
                            </div>
                            <p className="font-bold text-slate-900 text-xs">{link.label}</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* 📂 Dashboard Links (Non-Admin) */}
                  {isLoggedIn && !isAdmin && !isMedical && (
                    <div className="pt-2 border-t border-slate-50">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2 mb-2">My Portal</p>
                      <div className="space-y-1">
                        {DASHBOARD_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={close}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <link.icon size={14} />
                              </div>
                              <p className="font-bold text-slate-900 text-xs">{link.label}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🛡️ Admin/Staff Nodes */}
                  {(isAdmin || isMedical) && (
                    <div className="pt-2 border-t border-slate-50">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2 mb-2">Management</p>
                       <div className="space-y-2">
                         {isAdmin && (
                            <Link
                              href="/adminControl"
                              onClick={close}
                              className="flex items-center gap-4 p-2.5 bg-slate-900 rounded-xl group transition-all"
                            >
                              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                <Shield size={14} />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-white text-xs">Admin Panel</p>
                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest leading-none mt-1">Full Control</p>
                              </div>
                              <ChevronRight size={14} className="text-white/20 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                         )}
                         {isMedical && (
                            <Link
                              href="/medicalControl"
                              onClick={close}
                              className="flex items-center gap-4 p-2.5 bg-blue-600 rounded-xl group transition-all"
                            >
                              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                <Stethoscope size={14} />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-white text-xs">Medical Panel</p>
                                <p className="text-blue-200 text-[10px] uppercase font-bold tracking-widest leading-none mt-1">Health Management</p>
                              </div>
                              <ChevronRight size={14} className="text-white/20 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                         )}
                       </div>
                    </div>
                  )}

                  {/* 🔑 Auth CTA */}
                  {!isLoggedIn && (
                    <div className="pt-2">
                       <Link
                        href="/login"
                        onClick={close}
                        className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                      >
                        Secure Login / Join
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* 🚪 Panel Footer */}
              {isLoggedIn && (
                <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/50">
                  <button
                    onClick={() => { close(); handleSignOut(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-sm"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
