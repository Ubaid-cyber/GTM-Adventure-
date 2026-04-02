import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import SearchBar from './SearchBar';
import LogoutButton from './LogoutButton';
import MobileMenu from './MobileMenu';

export default async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4L2 28H30L16 4Z" fill="#1e3a8a"/>
              <path d="M16 4L11 12H21L16 4Z" fill="white"/>
            </svg>
            <span className="font-bold text-primary text-base tracking-tight">GTM Adventures</span>
          </Link>

          {/* Role-Adaptive Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {(session?.user as any)?.role === 'LEADER' ? (
              // 🧗 GROUP LEADER: Operational View
              <>
                <Link href="/dashboard" className="text-sm text-primary hover:text-primary-hover font-extrabold transition-colors flex items-center gap-1.5 whitespace-nowrap uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  Dashboard
                </Link>
                <Link href="/dashboard/participants" className="text-sm text-slate-600 hover:text-cyan-600 font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                  My Participants
                </Link>
                <Link href="/dashboard/safety" className="text-sm text-slate-600 hover:text-emerald-600 font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Safety Records
                </Link>
              </>
            ) : (
              // 🏔️ TREKKER / GUEST: Consumer View
              <>
                <Link href="/treks" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">Treks</Link>
                <Link href="/treks" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">Destinations</Link>
                <Link href="/treks" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">Featured Treks</Link>
                <Link href="/about" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">About</Link>
                {isLoggedIn && (
                  <>
                    <Link href="/dashboard/bookings" className="text-sm text-muted hover:text-foreground font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                      My Bookings
                    </Link>
                    <Link href="/dashboard/health" className="text-sm text-muted hover:text-foreground font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                      Medical Info
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Search Engine */}
          <SearchBar />

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                <Link href="/dashboard/profile" className="flex items-center gap-2 group transition-all">
                  <span className="hidden sm:block text-base font-bold text-slate-800 tracking-tight lowercase">
                    {session.user?.name?.split(' ')[0] || 'user'}
                  </span>
                  <div className="w-10 h-10 bg-[#e8eef6] border border-[#d1dceb] rounded-full flex items-center justify-center text-[#1c398e] text-lg font-black shadow-sm group-hover:shadow-md transition-all">
                    {session.user?.image
                      ? <img src={session.user.image} alt="User" className="w-full h-full object-cover rounded-full" />
                      : (session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U')}
                  </div>
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
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
