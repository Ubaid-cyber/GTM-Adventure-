'use client';

import { handleSignOut } from '@/components/layout/LogoutButton';
import { LogOut } from 'lucide-react';

export default function MedicalLogoutButton() {
  return (
    <button
      onClick={handleSignOut}
      type="button"
      title="Sign out"
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all text-[11px] font-semibold border border-gray-200 hover:border-red-100"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
