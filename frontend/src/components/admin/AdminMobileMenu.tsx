'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BarChart3, MapPin, Users, CreditCard, CalendarCheck, Inbox, FileText, Navigation, Star, LogOut, Plus } from 'lucide-react';
import { signOut } from 'next-auth/react';

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
    <div className="lg:hidden">
      {/* Hamburger Trigger */}
      <button
        onClick={toggle}
        className="p-2 text-white/60 hover:text-white transition-colors"
        aria-label="Toggle Admin Menu"
      >
        <Menu size={22} />
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            />

            {/* Right Drawer */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-72 bg-[#0f0f0f] border-l border-white/5 z-[9999] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">GTM Administration</p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Admin Panel</p>
                </div>
                <button onClick={close} className="p-2 text-white/30 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest px-3 mb-3">Navigation</p>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={close}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-600/15 text-white'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}

                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest px-3 mb-3">Quick Actions</p>
                  <Link
                    href="/adminControl/tours/new"
                    onClick={close}
                    className="flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">New Trek</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={async () => {
                    close();
                    await signOut({ redirect: false });
                    window.location.assign('/');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
