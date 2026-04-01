'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Compass, Shield, Heart, User, LogOut, Users } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

interface MobileMenuProps {
  session: Session | null;
}

export default function MobileMenu({ session }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = !!session?.user;

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } } as const,
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } } as const
  };

  const overlayVariants = {
    closed: { opacity: 0 } as const,
    open: { opacity: 1 } as const
  };

  const navLinks = [
    { href: '/treks', label: 'Featured Treks', icon: Compass },
    { href: '/dashboard/bookings', label: 'My Bookings', icon: Shield, protected: true },
    { href: '/dashboard/health', label: 'Medical Portal', icon: Heart, protected: true },
    { href: '/dashboard/profile', label: 'Profile Settings', icon: User, protected: true },
  ];

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <button 
        onClick={toggleMenu}
        className="p-2 text-slate-600 hover:text-primary transition-colors hover:bg-slate-50 rounded-xl"
        aria-label="Toggle Menu"
      >
        <Menu size={24} strokeWidth={2.5} />
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4L2 28H30L16 4Z" fill="currentColor"/>
                      </svg>
                   </div>
                   <span className="font-black text-primary text-sm tracking-tighter uppercase italic">GTM Elite</span>
                </div>
                <button 
                  onClick={toggleMenu}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-2">
                  {((session?.user as any)?.role === 'LEADER' || (session?.user as any)?.role === 'ADMIN') ? (
                    // 🏛️ GROUP LEADER: Operational Mobile View
                    <>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Command Center</h3>
                      <div className="space-y-2 mb-8">
                        <Link 
                          href="/dashboard"
                          onClick={toggleMenu}
                          className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20 hover:border-primary/40 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                <Shield size={20} />
                             </div>
                             <div className="flex flex-col">
                                <span className="font-black text-primary text-xs uppercase tracking-widest leading-none mb-1">Executive Dashboard</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Operational Oversight</span>
                             </div>
                          </div>
                          <ChevronRight size={16} className="text-primary transition-all group-hover:translate-x-1" />
                        </Link>

                        <Link 
                          href="/dashboard/participants"
                          onClick={toggleMenu}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-cyan-500/20 hover:bg-white hover:shadow-xl hover:shadow-cyan-500/5 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                <Users size={20} />
                             </div>
                             <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-xs uppercase tracking-widest leading-none mb-1">My Participants</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Team Management</span>
                             </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-cyan-500 transition-all group-hover:translate-x-1" />
                        </Link>

                        <Link 
                          href="/dashboard/safety"
                          onClick={toggleMenu}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-500/20 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Heart size={20} />
                             </div>
                             <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-xs uppercase tracking-widest leading-none mb-1">Safety Records</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical Clearance</span>
                             </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    // 🧗 TREKKER / GUEST: Consumer Mobile View
                    <>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Navigation Menu</h3>
                      {navLinks.map((link) => {
                        if (link.protected && !isLoggedIn) return null;
                        const Icon = link.icon;
                        return (
                          <Link 
                            key={link.href}
                            href={link.href}
                            onClick={toggleMenu}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/20 group-hover:shadow-sm transition-all">
                                  <Icon size={20} />
                               </div>
                               <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">{link.label}</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>

                {!isLoggedIn && (
                  <div className="pt-4">
                    <Link 
                      href="/login" 
                      onClick={toggleMenu}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center block shadow-lg shadow-primary/20"
                    >
                      Login / Signup
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer / User Profile */}
              {isLoggedIn && (
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-1 shadow-sm">
                          {session.user?.image 
                            ? <img src={session.user.image} className="w-full h-full rounded-xl object-cover" alt="User" />
                            : <span className="text-primary font-black uppercase text-xl">{session.user?.name?.charAt(0)}</span>
                          }
                       </div>
                       <div>
                          <div className="text-sm font-black text-slate-900 leading-none mb-1">{session.user?.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Member</div>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/20 transition-all active:scale-[0.98]"
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
