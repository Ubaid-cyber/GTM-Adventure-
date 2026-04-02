'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Shield, User, Heart, Search, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface MedicalProfile {
  id: string;
  status: 'NONE' | 'AWAITING_CLEARANCE' | 'IN_REVIEW' | 'CLEARED';
  vitals: any;
  history: any;
  medicalNotes?: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    profileImage?: string;
  }
}

interface LeaderMedicalViewProps {
   user: any;
   apiToken: string;
   onBack: () => void;
}

export const LeaderMedicalView: React.FC<LeaderMedicalViewProps> = ({ user, apiToken, onBack }) => {
  const [profiles, setProfiles] = useState<MedicalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leader/medical-records`, {
          headers: { 
            'Authorization': `Bearer ${apiToken}`,
            'x-user-email': user.email 
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) setProfiles(data);
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicalRecords();
  }, [user.email, apiToken]);

  const filteredProfiles = profiles.filter(p => 
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-pulse">
       <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4" />
       <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Scanning Personnel Health Logs...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* 🛡️ LEADER MEDICAL OVERSIGHT HUD */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
           <button 
             onClick={onBack}
             className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-cyan-600 transition-colors uppercase tracking-widest mb-4"
           >
              <ChevronLeft className="w-4 h-4" /> Return to Command
           </button>
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-cyan-600 rounded-full"></div>
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em]">Health Oversight Protocol</p>
           </div>
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
              Personnel <span className="text-cyan-600/80">Health Clearance</span>
           </h2>
        </div>

        <div className="relative group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-cyan-500 transition-colors" />
           <input 
             type="text" 
             placeholder="Search by Name or ID..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="bg-white border border-slate-200 rounded-full pl-14 pr-8 py-4 text-xs font-bold outline-none focus:border-cyan-500/30 focus:shadow-xl transition-all w-full lg:w-96"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredProfiles.map((profile, i) => (
           <motion.div 
             key={profile.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:border-cyan-500/20 hover:shadow-xl transition-all group overflow-hidden relative"
           >
              {/* STATUS INDICATOR */}
              <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest ${
                profile.status === 'CLEARED' ? 'bg-emerald-500 text-white' : 
                profile.status === 'AWAITING_CLEARANCE' ? 'bg-amber-500 text-white' : 
                'bg-slate-200 text-slate-600'
              }`}>
                 {profile.status}
              </div>

              <div className="flex items-center gap-5 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-black text-white italic shrink-0">
                    {profile.user.name.charAt(0)}
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight italic">{profile.user.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">{profile.user.email}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Pressure</p>
                       <p className="text-base font-black text-slate-900">{profile.vitals?.bp || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Fitness Tier</p>
                       <p className="text-base font-black text-slate-900">Tier-{i+1}</p>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50">
                    <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Heart className="w-3.5 h-3.5 text-rose-500" /> Medical History
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {Object.entries(profile.history || {}).some(([_, v]) => v === true) ? (
                          Object.entries(profile.history || {}).map(([key, val]) => (
                             val === true && (
                                <span key={key} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-100">
                                   {key.toUpperCase()}
                                </span>
                             )
                          ))
                       ) : (
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No Critical Risks Detected</span>
                       )}
                    </div>
                 </div>

                 {profile.medicalNotes && (
                   <div className="bg-cyan-50/50 p-5 rounded-2xl border border-cyan-100 mt-4">
                      <p className="text-[8px] font-black text-cyan-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Shield className="w-3.5 h-3.5" /> Surgeon's Notes
                      </p>
                      <p className="text-[10px] font-medium leading-relaxed text-slate-600">{profile.medicalNotes}</p>
                   </div>
                 )}
              </div>
           </motion.div>
         ))}

         {filteredProfiles.length === 0 && (
           <div className="col-span-full py-40 bg-slate-50 border border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-center">
              <Activity className="w-16 h-16 text-slate-200 mb-6" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">No Personnel Records Found</h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm">Either no participants are confirmed, or the health database has not yet synchronization for your sectors.</p>
           </div>
         )}
      </div>
    </div>
  );
};
