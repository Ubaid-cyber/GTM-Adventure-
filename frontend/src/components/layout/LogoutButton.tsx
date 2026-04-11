'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

/** Shared logout handler — client-side only, no server round-trip */
export async function handleSignOut() {
  try {
    await signOut({ redirect: false });
  } catch {
    // ignore — we navigate anyway
  }
  window.location.href = '/';
}

export default function LogoutButton() {
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
