import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:bg-green-700 transition-colors">
              G
            </div>
            <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
               GTM-Adventure
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/treks" className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors">
              Explore Treks
            </Link>
            {isLoggedIn && (
              <Link href="/dashboard/bookings" className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                My Adventures
              </Link>
            )}
            <Link href="/about" className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                   <div className="text-xs font-bold text-gray-900">{session.user?.name || 'Explorer'}</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Authenticated</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-full border border-green-200 flex items-center justify-center text-green-700 font-bold overflow-hidden shadow-inner">
                   {session.user?.image ? (
                     <img src={session.user.image} alt="User" />
                   ) : (
                     session.user?.name ? session.user.name.charAt(0) : 'U'
                   )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
