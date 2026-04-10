'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, LogOut, Shield, User } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import MountainLogo from '../common/MountainLogo';
import { publicNavLinks, protectedNavLinks } from '@/config/navigation';

interface MobileMenuProps {
  session: Session | null;
}

export default function MobileMenu({ session }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'ADMIN';

  // Toggle Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: { opacity: 0, x: '100%' },
    open: { opacity: 1, x: 0 }
  };

  return (
    <div className="md:hidden">
      {/* TRIGGER BUTTON */}
      <button 
        onClick={toggleMenu}
        className="p-2 text-slate-900 transition-transform active:scale-90"
        aria-label="Toggle Menu"
      >
        <Menu size={28} />
      </button>

      {/* MOBILE DRAWER (Fixed Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />
            
            {/* Drawer */}
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white z-[9999] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <MountainLogo className="w-6 h-6 text-slate-900" />
                   <span className="font-black text-slate-900 text-xs tracking-tighter uppercase italic">GTM ADVENTURES</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={28} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-6 space-y-8">
                  
                  {/* NAVIGATION LINKS */}
                  {!isAdmin && (
                    <>
                      {/* Standard User Links */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expedition Discovery</p>
                        {publicNavLinks.map((link) => (
                          <Link 
                            key={link.href}
                            href={link.href}
                            onClick={toggleMenu}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all group"
                          >
                             <span className="font-bold text-slate-800 text-sm">{link.label}</span>
                             <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900" />
                          </Link>
                        ))}
                      </div>

                      {isLoggedIn && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Command Center</p>
                          {protectedNavLinks.map((link) => (
                            <Link 
                              key={link.href}
                              href={link.href}
                              onClick={toggleMenu}
                              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all group"
                            >
                               <span className="font-bold text-slate-700 text-sm">{link.label}</span>
                               <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-900" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {!isLoggedIn && (
                    <div className="pt-4">
                      <Link 
                        href="/login" 
                        onClick={toggleMenu}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-center block shadow-lg"
                      >
                        Login / Join Expedition
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Profile */}
              {isLoggedIn && (
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <Link 
                    href="/dashboard/profile"
                    onClick={toggleMenu}
                    className="flex items-center gap-4 mb-6 hover:opacity-80 transition-opacity"
                  >
                     <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-xl text-slate-900 shadow-sm">
                        {isAdmin ? 'A' : (session.user?.name?.charAt(0) || <User size={20} />)}
                     </div>
                     <div>
                        <p className="font-bold text-slate-950 text-sm leading-none mb-1">{session.user?.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {isAdmin ? 'Administrator' : 'Active Member'}
                        </p>
                     </div>
                  </Link>
                  <button 
                    onClick={async () => {
                      await signOut({ redirect: false });
                      window.location.assign('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white border border-rose-100 text-rose-500 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <LogOut size={16} />
                    Secure Logout
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
