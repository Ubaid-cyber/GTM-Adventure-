import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getLeaderParticipantsAction } from '@/lib/actions/leader-actions';
import { ParticipantsView } from './ParticipantsView';
import { cookies } from 'next/headers';

export default async function LeaderParticipantsPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user || (user.role !== 'LEADER' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  // NextAuth v5 session doesn't expose the JWT token directly in 'auth()' 
  // depending on configuration. In this project, we handle it via a cookie
  // or use the server session to authorize.
  // Assuming the backend environment uses the same DATABASE_URL,
  // we could potentially fetch direct, but for consistency with existing 
  // modules like Medical, we use the API path.
  
  try {
    const participants = await getLeaderParticipantsAction();
    
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-12 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <ParticipantsView participants={participants} />
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('Leader Participants Error:', error.message);
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-12">
        <div className="bg-white/5 border border-white/10 p-12 rounded-[48px] text-center max-w-md">
           <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
           </div>
           <h2 className="text-xl font-bold text-white uppercase tracking-tighter mb-4">Command Link Failure</h2>
           <p className="text-white/40 text-sm font-medium leading-relaxed mb-10">
              We encountered an issue synchronizing your assigned trekker dossier. 
              Error: {error.message}
           </p>
           <button 
             onClick={async () => { 'use server'; redirect('/dashboard'); }}
             className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-colors"
           >
              Return to Control
           </button>
        </div>
      </div>
    );
  }
}
