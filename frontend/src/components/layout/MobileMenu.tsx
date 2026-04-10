'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Menu, X, ChevronRight, LogOut, Mountain } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import MountainLogo from '../common/MountainLogo';
import { publicNavLinks, protectedNavLinks, staffNavLinks } from '@/config/navigation';

interface MobileMenuProps {
  session: Session | null;
}

export default function MobileMenu({ session }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Add/Remove scroll lock
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const menuVariants = {
    closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } } as const,
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } } as const
  };

  return (
    <div className="md:hidden">
      <button 
        onClick={toggleMenu}
        className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
        aria-label="Toggle Menu"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && mounted && createPortal(
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[9998]"
            />
            
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed inset-y-0 right-0 w-[90%] max-w-sm bg-white z-[100] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)] border-l border-slate-100"
              style={{ height: '100dvh', backgroundColor: '#ffffff' }}
            >
              {/* Header - Fixed Height Area */}
              <div className="flex-shrink-0 p-5 flex items-center justify-between border-b border-slate-50 bg-white">
                <div className="flex items-center gap-2">
                   <MountainLogo className="w-5 h-5 text-slate-900" />
                   <span className="font-bold text-slate-900 text-[11px] tracking-tight uppercase italic">GTM ADVENTURES</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-slate-400 hover:text-slate-950 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Body - Forced White Background */}
              <div className="flex-1 overflow-y-auto p-4 space-y-7 bg-white no-scrollbar">
                
                {/* 1. Expedition Discovery (Links) */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Expedition Menu</p>
                  <div className="space-y-1">
                    {publicNavLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link 
                          key={link.href}
                          href={link.href}
                          onClick={toggleMenu}
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all group"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                 <Icon size={18} />
                              </div>
                              <span className="font-bold text-slate-900 text-sm tracking-tight">{link.label}</span>
                           </div>
                           <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Command Center (Protected) */}
                {isLoggedIn && (
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Command Center</p>
                    <div className="space-y-1">
                      {protectedNavLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link 
                            key={link.href}
                            href={link.href}
                            onClick={toggleMenu}
                            className="flex items-center justify-between p-4 px-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                               <Icon size={16} className="text-slate-400 group-hover:text-slate-800" />
                               <span className="font-bold text-slate-800 text-[13px]">{link.label}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-900" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Operations (Staff) */}
                {isLoggedIn && staffNavLinks.some(l => l.roles?.includes(userRole)) && (
                   <div className="space-y-4 pt-4 border-t border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Operations</p>
                     <div className="space-y-2">
                       {staffNavLinks.map((link) => {
                         if (!link.roles?.includes(userRole)) return null;
                         const Icon = link.icon;
                         return (
                          <Link 
                            key={link.href}
                            href={link.href}
                            onClick={toggleMenu}
                            className="flex items-center justify-between p-4 px-6 bg-slate-900 rounded-[24px] text-white transition-all active:scale-[0.98] shadow-lg shadow-black/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                                  <Icon size={16} />
                              </div>
                              <span className="font-bold text-[10px] uppercase tracking-[0.15em]">{link.label}</span>
                            </div>
                            <ChevronRight size={16} className="opacity-30" />
                          </Link>
                         );
                       })}
                     </div>
                   </div>
                )}
                {!isLoggedIn && (
                  <div className="pt-2">
                    <Link 
                      href="/login" 
                      onClick={toggleMenu}
                      className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold text-[11px] uppercase tracking-[0.2em] text-center block shadow-xl shadow-black/10"
                    >
                      Login / Join Expedition
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer Profile Area - Forced Solid Background */}
              {isLoggedIn && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/80">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 px-2">
                       <div className="w-11 h-11 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                          {session.user?.image 
                            ? <img src={session.user.image} className="w-full h-full object-cover" alt="User profile" />
                            : <span className="font-black text-slate-900 uppercase text-lg">{session.user?.name?.charAt(0)}</span>
                          }
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-950 leading-none mb-1">{session.user?.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Member</p>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      await signOut({ redirect: false });
                      window.location.assign('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-rose-100 text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}
