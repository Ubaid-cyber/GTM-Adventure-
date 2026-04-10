import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import SearchBar from './SearchBar';
import LogoutButton from './LogoutButton';
import MobileMenu from './MobileMenu';
import MountainLogo from '../common/MountainLogo';
import { Shield } from 'lucide-react';
import { publicNavLinks, protectedNavLinks } from '@/config/navigation';

export default async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-80">
            <MountainLogo className="w-8 h-8 text-slate-900" />
            <span className="font-bold text-slate-900 text-base tracking-tight">GTM Adventures</span>
          </Link>

          {/* Navigation - Isolated for Admins */}
          <nav className="hidden md:flex items-center gap-6">
            {userRole !== 'ADMIN' && (
              <>
                {publicNavLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isLoggedIn && (
                  <>
                    <div className="h-4 w-px bg-slate-200 mx-2 shrink-0" />
                    {protectedNavLinks.map((link) => (
                       <Link 
                         key={link.href} 
                         href={link.href} 
                         className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                       >
                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                         {link.label}
                       </Link>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Always visible staff links but styled differently for isolation */}
            {isLoggedIn && (
              <>
                {userRole === 'LEADER' && (
                   <Link href="/dashboard" className="text-[10px] bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Leader Console
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Search Engine - Hidden for Admins to reduce noise */}
          {userRole !== 'ADMIN' && <SearchBar />}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                <Link href="/dashboard/profile" className="flex items-center gap-2 group transition-all">
                  <span className="hidden sm:block text-sm font-bold text-slate-900 tracking-tight lowercase">
                    {userRole === 'ADMIN' ? 'Administrator' : (session.user?.name?.split(' ')[0] || 'account')}
                  </span>
                  <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-105 transition-all overflow-hidden">
                    {userRole === 'ADMIN' ? 'A' : (session.user?.image
                      ? <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                      : (session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'))}
                  </div>
                </Link>
                <div className="h-4 w-px bg-slate-200 mx-1 flex md:hidden sm:flex" />
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/5 hover:scale-105 active:scale-95">
                Login / Signup
              </Link>
            )}
            
            <MobileMenu session={session} />
          </div>
        </div>
      </div>
    </header>
  );
}
