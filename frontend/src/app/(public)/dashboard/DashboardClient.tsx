'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LeaderDashboard } from './components/LeaderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TrekkerDashboard } from './components/TrekkerDashboard';

export default function DashboardClient({ apiToken, isLeader }: { apiToken: string; isLeader: boolean }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const role = user?.role;

  // 🏛️ SECURE ROUTING EFFECT
  React.useEffect(() => {
    if (status === 'loading') return;
    
    if (role === 'ADMIN') {
      router.push('/adminControl');
    } else if (role === 'TREKKER') {
      router.push('/');
    }
  }, [role, router, status]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  // 🏛️ HQ COMMAND CENTER REDIRECTION UI
  if (role === 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
         <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
           <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading Admin Dashboard...</p>
         </div>
      </div>
    );
  }

  if (role === 'TREKKER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-6 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Leader Dashboard */}
        {role === 'LEADER' && <LeaderDashboard user={user} apiToken={apiToken} />}
      </div>
    </div>
  );
}
