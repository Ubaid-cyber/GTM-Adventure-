import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import SearchBar from './SearchBar';

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

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/treks" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">Treks</Link>
            <Link href="/treks" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">Destinations</Link>
            <Link href="/treks" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">Expeditions</Link>
            <Link href="/about" className="text-sm text-muted hover:text-foreground font-medium transition-colors whitespace-nowrap">About</Link>
            {isLoggedIn && (
              <>
                <Link href="/dashboard/bookings" className="text-sm text-muted hover:text-foreground font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                  My Bookings
                </Link>
                <Link href="/dashboard/health" className="text-sm text-muted hover:text-foreground font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                  Health & Vitals
                </Link>
              </>
            )}
          </nav>

          {/* Search Engine */}
          <SearchBar />

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard/profile" className="flex items-center gap-2 group hover:opacity-80 transition-all">
                <span className="hidden sm:block text-sm font-semibold text-foreground border-b border-transparent group-hover:border-primary transition-all">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                  {session.user?.image
                    ? <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    : (session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U')}
                </div>
              </Link>
            ) : (
              <Link href="/login" className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
