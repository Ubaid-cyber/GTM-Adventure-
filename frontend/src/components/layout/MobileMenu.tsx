'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Compass, Info, Image as ImageIcon,
  CalendarCheck, Heart, User, Shield, LogOut, ChevronRight,
  Mountain
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
  const firstName = session?.user?.name?.split(' ')[0] || 'Adventurer';

  // Lock body scroll with scrollbar compensation
  useEffect(() => {
    if (isOpen) {
      const sw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${sw}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden" style={{ isolation: 'isolate' }}>
      {/* Hamburger Trigger */}
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
            {/* Full-screen backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999998]"
            />

            {/* Slide-in drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 w-[88%] max-w-sm bg-white z-[999999] flex flex-col shadow-2xl"
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Mountain size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-[13px] tracking-tight leading-none">GTM Adventures</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Explore. Summit. Repeat.</p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Scrollable Content ── */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 space-y-6">

                  {/* Greeting if logged in */}
                  {isLoggedIn && (
                    <div className="px-2 pb-2 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Welcome back</p>
                      <p className="text-slate-900 font-black text-lg leading-tight capitalize">{firstName} 👋</p>
                    </div>
                  )}

                  {/* ── Explore Section ── */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Explore</p>
                    <div className="space-y-1">
                      {PUBLIC_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={close}
                          className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-all group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <link.icon size={18} className="text-slate-700" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-none">{link.label}</p>
                              <p className="text-slate-400 text-[11px] mt-0.5">{link.desc}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* ── Dashboard Section (Logged-in regular users) ── */}
                  {isLoggedIn && !isAdmin && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">My Account</p>
                      <div className="space-y-1">
                        {DASHBOARD_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={close}
                            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-all group"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <link.icon size={18} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm leading-none">{link.label}</p>
                                <p className="text-slate-400 text-[11px] mt-0.5">{link.desc}</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Admin Shortcut ── */}
                  {isAdmin && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Administration</p>
                      <Link
                        href="/adminControl"
                        onClick={close}
                        className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl group transition-all hover:bg-slate-800"
                      >
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <Shield size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">Admin Panel</p>
                          <p className="text-white/50 text-[11px]">Manage tours, bookings & more</p>
                        </div>
                        <ChevronRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}

                  {/* ── Login CTA (not logged in) ── */}
                  {!isLoggedIn && (
                    <div className="pt-2">
                      <Link
                        href="/login"
                        onClick={close}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors"
                      >
                        Login / Get Started
                      </Link>
                    </div>
                  )}

                </div>
              </div>

              {/* ── Footer (Sign Out) ── */}
              {isLoggedIn && (
                <div className="px-4 py-4 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => { close(); handleSignOut(); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-rose-100 text-rose-500 font-bold text-sm hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
