'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import MountainLogo from '../common/MountainLogo';
import { publicNavLinks, protectedNavLinks, staffNavLinks } from '@/config/navigation';

interface MobileMenuProps {
  session: Session | null;
}

export default function MobileMenu({ session }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role;

  const toggleMenu = () => setIsOpen(!isOpen);

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
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[60]"
            />
            
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] flex flex-col shadow-2xl border-l border-slate-100"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                   <MountainLogo className="w-6 h-6 text-slate-900" />
                   <span className="font-bold text-slate-900 text-xs tracking-tight italic uppercase">GTM ADVENTURES</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
                
                {/* Main Grid Navigation - Instant Visibility */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-4">Expedition Menu</p>
                  <div className="grid grid-cols-2 gap-3">
                    {publicNavLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link 
                          key={link.href}
                          href={link.href}
                          onClick={toggleMenu}
                          className="flex flex-col items-center justify-center gap-3 p-6 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all active:scale-[0.98] group shadow-sm shadow-black/[0.01]"
                        >
                           <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                              <Icon size={20} />
                           </div>
                           <span className="font-bold text-slate-900 text-[10px] uppercase tracking-wider text-center">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Dashboard & Profile - Compact List */}
                {isLoggedIn && (
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-1">Command Center</p>
                    <div className="grid grid-cols-1 gap-2">
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
                               <Icon size={18} className="text-slate-400 group-hover:text-slate-900" />
                               <span className="font-bold text-slate-900 text-[13px]">{link.label}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Operations */}
                {isLoggedIn && staffNavLinks.some(l => l.roles?.includes(userRole)) && (
                   <div className="space-y-4 pt-6 border-t border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-1">Operations</p>
                     <div className="grid grid-cols-1 gap-2">
                       {staffNavLinks.map((link) => {
                         if (!link.roles?.includes(userRole)) return null;
                         const Icon = link.icon;
                         return (
                          <Link 
                            key={link.href}
                            href={link.href}
                            onClick={toggleMenu}
                            className="flex items-center justify-between p-4 px-6 bg-slate-950 rounded-[28px] text-white transition-all active:scale-[0.98] shadow-lg shadow-black/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                  <Icon size={18} />
                              </div>
                              <span className="font-black text-[10px] uppercase tracking-[0.2em]">{link.label}</span>
                            </div>
                            <ChevronRight size={16} className="opacity-40" />
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
                      className="w-full bg-slate-950 text-white py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.25em] text-center block shadow-xl shadow-black/10"
                    >
                      Login / Join
                    </Link>
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <div className="p-6 border-t border-slate-50 bg-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 px-2">
                       <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                          {session.user?.image 
                            ? <img src={session.user.image} className="w-full h-full object-cover" alt="User" />
                            : <span className="font-black text-slate-950 uppercase text-xl">{session.user?.name?.charAt(0)}</span>
                          }
                       </div>
                       <div>
                          <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-0.5">{session.user?.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Member</p>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      await signOut({ redirect: false });
                      window.location.assign('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
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
