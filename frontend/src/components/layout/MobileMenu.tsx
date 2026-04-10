'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Compass, Shield, Heart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import MountainLogo from '../common/MountainLogo';

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

  const navLinks = [
    { href: '/treks', label: 'Explore Treks', icon: Compass },
    { href: '/dashboard/bookings', label: 'My Bookings', icon: Shield, protected: true },
    { href: '/dashboard/health', label: 'Health Form', icon: Heart, protected: true },
    { href: '/dashboard/profile', label: 'My Account', icon: User, protected: true },
  ];

  const role = (session?.user as any)?.role;
  const isStaff = role === 'ADMIN' || role === 'LEADER';

  return (
    <div className="md:hidden">
      <button 
        onClick={toggleMenu}
        className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[60]"
            />
            
            {/* Menu Drawer */}
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                   <MountainLogo className="w-6 h-6 text-slate-900" />
                   <span className="font-bold text-slate-900 text-sm tracking-tight">GTM Adventures</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Main Navigation */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Navigation</p>
                  {navLinks.map((link) => {
                    if (link.protected && !isLoggedIn) return null;
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href}
                        href={link.href}
                        onClick={toggleMenu}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                              <Icon size={20} />
                           </div>
                           <span className="font-semibold text-slate-900">{link.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                      </Link>
                    );
                  })}
                </div>

                {/* Staff Access (Simple English) */}
                {isStaff && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Staff Only</p>
                    <Link 
                      href={role === 'ADMIN' ? "/adminControl" : "/dashboard"}
                      onClick={toggleMenu}
                      className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <LayoutDashboard size={20} />
                         </div>
                         <span className="font-bold text-sm uppercase tracking-wide">
                            {role === 'ADMIN' ? 'Admin Panel' : 'Leader Console'}
                         </span>
                      </div>
                      <ChevronRight size={18} className="opacity-50" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer Section (User Info / Auth) */}
              <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                       <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center overflow-hidden">
                          {session.user?.image 
                            ? <img src={session.user.image} className="w-full h-full object-cover" alt="User" />
                            : <span className="font-black text-slate-900 uppercase">{session.user?.name?.charAt(0)}</span>
                          }
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{session.user?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged In</p>
                       </div>
                    </div>
                    <button 
                      onClick={async () => {
                        await signOut({ redirect: false });
                        window.location.assign('/');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-rose-100 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={toggleMenu}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-center block shadow-lg shadow-slate-900/10"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
