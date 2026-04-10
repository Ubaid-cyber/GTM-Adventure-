'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleSignOut = async () => {
    try {
      // Disable automatic library redirect to bypass poisoned NEXTAUTH_URL
      await signOut({ 
        redirect: false
      });
      // Force manual navigation to site root relative to current origin
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: Force jump to home if dev server hangs
      window.location.href = '/';
    }
  };

  return (
    <button 
      onClick={handleSignOut}
      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-transparent"
      title="Terminate Session"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
