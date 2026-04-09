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
    { href: '/treks', label: 'Explore Treks', icon: Compass },
    { href: '/dashboard/bookings', label: 'My Trips', icon: Shield, protected: true },
    { href: '/dashboard/health', label: 'Health Form', icon: Heart, protected: true },
    { href: '/dashboard/profile', label: 'Account', icon: User, protected: true },
  ];

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <button 
        onClick={toggleMenu}
        className="p-2 text-muted hover:text-primary transition-colors hover:bg-surface rounded-xl"
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
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-[60]"
            />
            
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col"
            >

              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4L2 28H30L16 4Z" fill="currentColor"/>
                      </svg>
                   </div>
                   <span className="font-black text-primary text-sm tracking-tighter uppercase italic leading-none pt-1">GTM Elite</span>
                </div>
                <button 
                  onClick={toggleMenu}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full transition-all active:scale-95"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-2">
                {/* 🏔️ Core Navigation Menu (Trekker View) */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-4">Navigation Menu</h3>
                  {navLinks.map((link) => {
                    if (link.protected && !isLoggedIn) return null;
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href}
                        href={link.href}
                        onClick={toggleMenu}
                        className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border hover:border-primary/20 hover:bg-background/40 transition-all group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted group-hover:text-primary group-hover:border-primary/20 transition-all">
                              <Icon size={20} />
                           </div>
                           <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{link.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </Link>
                    );
                  })}
                </div>

                {/* 🛡️ Strategic Operational Access (Staff Only) */}
                {((session?.user as any)?.role === 'LEADER' || (session?.user as any)?.role === 'ADMIN') && (
                  <div className="pt-4 space-y-4 border-t border-slate-100">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4">Staff Command</h3>
                    
                    <Link 
                      href={(session?.user as any)?.role === 'ADMIN' ? "/adminControl" : "/dashboard"}
                      onClick={toggleMenu}
                      className="flex items-center justify-between p-4 bg-primary/[0.03] rounded-2xl border border-primary/20 hover:border-primary hover:bg-white transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Shield size={20} />
                         </div>
                         <div className="flex flex-col">
                            <span className="font-black text-primary text-xs uppercase tracking-widest leading-none mb-1">
                              {(session?.user as any)?.role === 'ADMIN' ? 'Admin HQ' : 'Leader Dashboard'}
                            </span>
                            <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">Secure Operations</span>
                         </div>
                      </div>
                      <ChevronRight size={16} className="text-primary transition-all group-hover:translate-x-1" />
                    </Link>

                    {(session?.user as any)?.role === 'ADMIN' && (
                      <Link 
                        href="/dashboard/participants"
                        onClick={toggleMenu}
                        className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border hover:border-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                              <Users size={20} />
                           </div>
                           <div className="flex flex-col text-left">
                              <span className="font-black text-foreground text-xs uppercase tracking-widest leading-none mb-1">Global Users</span>
                              <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">Directory</span>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-muted group-hover:text-cyan-500 transition-all group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>
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
                <div className="p-6 bg-surface border-t border-border">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-background rounded-2xl border border-border flex items-center justify-center p-1 shadow-sm overflow-hidden">
                          {session.user?.image 
                            ? <img src={session.user.image} className="w-full h-full rounded-xl object-cover" alt="User" />
                            : <span className="text-primary font-black uppercase text-xl">{session.user?.name?.charAt(0)}</span>
                          }
                       </div>
                       <div>
                          <div className="text-sm font-black text-foreground leading-none mb-1">{session.user?.name}</div>
                          <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Member</div>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-background border border-rose-500/20 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-[0.98]"
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
