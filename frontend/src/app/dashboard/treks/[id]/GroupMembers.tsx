'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Participant {
  id: string;
  name: string | null;
  profileImage: string | null;
  country: string | null;
  bio: string | null;
  role: string;
}

interface RosterData {
  participants: Participant[];
  leader: Participant | null;
}

export default function GroupMembers({ expeditionId }: { expeditionId: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoster() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/active-bookings/${expeditionId}/roster`, {
          headers: { 'x-user-email': session?.user?.email || '' }
        });
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (err) {
        console.error('Roster fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoster();
  }, [expeditionId]);

  if (loading) return <div className="p-10 text-center text-primary font-mono text-xs animate-pulse">Loading members...</div>;

  return (
    <div className="space-y-12 pb-20">
      {/* Expedition Leader */}
      {data?.leader && (
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(30,58,138,1)]"></div>
            Trek Leader
          </h3>
          <div className="bg-gradient-to-br from-primary/10 to-blue-900/10 border border-primary/20 rounded-3xl p-8 backdrop-blur-md flex flex-col md:flex-row gap-8 items-center md:items-start group hover:border-primary/40 transition-all">
             <div className="w-32 h-32 rounded-2xl border-2 border-primary/30 p-1 overflow-hidden">
                <img 
                  src={data.leader.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.leader.name}`} 
                  className="w-full h-full rounded-2xl object-cover"
                  alt="Leader"
                />
             </div>
             <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h4 className="text-3xl font-black tracking-tight">{data.leader.name}</h4>
                  <p className="text-primary font-mono text-[10px] uppercase tracking-widest mt-1">Lead Guide</p>
                </div>
                <p className="text-sm text-white/60 font-medium leading-relaxed max-w-xl">
                  {data.leader.bio || "No bio available."}
                </p>
                <div className="flex justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">Command Center</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">128 Treks</span>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* Participants */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
          Group Members
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.participants.map((person, idx) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.08] hover:border-white/20 transition-all group"
            >
              <div className="w-14 h-14 rounded-full border border-white/10 p-0.5 overflow-hidden flex-shrink-0">
                <img 
                  src={person.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
                  className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  alt={person.name || "Trekker"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold truncate">{person.name}</h5>
                  {person.country && <span className="text-xs opacity-60">({person.country})</span>}
                </div>
                <p className="text-[10px] text-white/30 truncate font-mono uppercase tracking-tighter">Status: Confirmed // Ready</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
