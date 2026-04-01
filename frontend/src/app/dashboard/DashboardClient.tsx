'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LeaderDashboard } from './components/LeaderDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export default function DashboardClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const role = user?.role || 'TREKKER';

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (role === 'TREKKER') {
    router.push('/treks');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* EXECUTIVE ORCHESTRATOR: Role-Based HUD Routing */}
        {role === 'ADMIN' && <AdminDashboard user={user} />}
        {role === 'LEADER' && <LeaderDashboard user={user} />}
      </div>
    </div>
  );
}
