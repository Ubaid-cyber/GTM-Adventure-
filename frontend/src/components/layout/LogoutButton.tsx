'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-transparent"
      title="Terminate Session"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
