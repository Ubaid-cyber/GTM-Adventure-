'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Shield, Heart, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface Participant {
  id: string;
  name: string | null;
  profileImage: string | null;
  country: string | null;
  bio: string | null;
  role: string;
  medicalProfile?: {
    status: string;
  };
}

interface RosterData {
  participants: Participant[];
  leader: Participant | null;
}

export default function GroupMembers({ 
  expeditionId, 
  apiToken,
  isLeader 
}: { 
  expeditionId: string, 
  apiToken: string,
  isLeader: boolean 
}) {
  const { data: session } = useSession();
  const [data, setData] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoster() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/active-bookings/${expeditionId}/roster`, {
          headers: { 
            'Authorization': `Bearer ${apiToken}`,
            'x-user-email': session.user.email 
          }
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
  }, [expeditionId, session?.user?.email, apiToken]);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
       <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Syncing Roster...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Expedition Leader */}
      {data?.leader && (
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-6 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Authorized Guide
          </h3>
          <div className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border border-cyan-500/20 rounded-[32px] p-8 backdrop-blur-md flex flex-col md:flex-row gap-8 items-center md:items-start group hover:border-cyan-500/40 transition-all">
             <div className="w-32 h-32 rounded-2xl border-2 border-cyan-500/30 p-1 overflow-hidden relative shadow-2xl">
                <img 
                  src={data.leader.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.leader.name}`} 
                  className="w-full h-full rounded-2xl object-cover"
                  alt="Leader"
                />
                <div className="absolute inset-0 bg-cyan-900/10"></div>
             </div>
             <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                   <h4 className="text-3xl font-black tracking-tight uppercase italic">{data.leader.name}</h4>
                   <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest mt-1">Operational Area: Everest Base Camp</p>
                </div>
                <p className="text-sm text-white/60 font-medium leading-relaxed max-w-xl">
                   {data.leader.bio || "Lead guide responsible for trek safety and telemetry oversight."}
                </p>
                <div className="flex justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                       <Activity className="w-3 h-3" /> Command Active
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">Guide Level 5</span>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* Participants */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
          Group Roster
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.participants.map((person, idx) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex items-center gap-5 hover:bg-white/[0.08] hover:border-cyan-500/20 transition-all group relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl border border-white/10 p-1 overflow-hidden flex-shrink-0 relative">
                <img 
                  src={person.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
                  className="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  alt={person.name || "Trekker"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-base font-black truncate uppercase tracking-tighter italic">{person.name}</h5>
                  {person.country && <span className="text-[10px] opacity-40 font-mono">({person.country})</span>}
                </div>
                
                <div className="flex items-center gap-3">
                   <p className="text-[9px] text-white/30 truncate font-mono uppercase tracking-tighter">ID: {person.id.slice(0,8)}</p>
                   
                   {/* 🛡️ MEDICAL OVERSIGHT BADGE (LEADER ONLY) */}
                   {person.medicalProfile && (
                     <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                        person.medicalProfile.status === 'CLEARED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                        person.medicalProfile.status === 'IN_REVIEW' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                     }`}>
                        {person.medicalProfile.status === 'CLEARED' ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                        Med: {person.medicalProfile.status}
                     </div>
                   )}
                </div>
              </div>
              
              <div className={`w-2 h-2 rounded-full ${person.medicalProfile?.status === 'CLEARED' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
            </motion.div>
          ))}

          {data?.participants.length === 0 && (
            <div className="col-span-full py-20 bg-white/5 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-white/40">
               <Activity className="w-10 h-10 mb-4 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-widest">No Participants Detected</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
