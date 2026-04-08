'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Globe, Shield, Activity, MapPin, 
  Wind, AlertTriangle, CheckCircle2, ChevronRight,
  Clock, Search, Filter
} from 'lucide-react';
import { getActiveMissionsAction } from '@/lib/actions/admin-actions';
import { formatDateTime } from '@/lib/utils/date-safe';

interface Mission {
  id: string;
  status: string;
  currentLocationName: string | null;
  currentAltitude: number | null;
  progressPercent: number;
  trek: {
    title: string;
    guide: {
      name: string;
      profileImage: string | null;
    } | null;
  };
  sitreps: any[];
  checklists: any[];
}

export default function MissionOversightView({ apiToken }: { apiToken: string }) {
  const { data: session } = useSession();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchMissions() {
      if (!session?.user?.email) return;
      try {
        const data = await getActiveMissionsAction();
        setMissions(data as any);
      } catch (err) {
        console.error('Oversight fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMissions();
  }, [session?.user?.email, apiToken]);

  const filteredMissions = missions.filter(m => 
    m.trek.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.trek.guide?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6" />
       <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] animate-pulse">Connecting to Live Feed...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Trip <span className="text-cyan-600">Monitor</span></h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Trip Tracking // {missions.length} Active Treks</p>
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search Treks..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:border-cyan-500/50 outline-none transition-all shadow-sm"
               />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-cyan-500/20 transition-all shadow-sm">
               <Filter className="w-4 h-4 text-slate-400" />
            </button>
         </div>
      </div>

      {/* MISSION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <AnimatePresence>
            {filteredMissions.map((mission, idx) => {
               const latestSitrep = mission.sitreps[0];
               const statusColor = latestSitrep?.status === 'RED' ? 'bg-rose-500' : latestSitrep?.status === 'AMBER' ? 'bg-amber-500' : 'bg-emerald-500';
               
               return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm group hover:border-cyan-500/20 transition-all relative overflow-hidden"
                  >
                     {/* PROGRESS BACKGROUND WATERMARK */}
                     <div className="absolute bottom-0 left-0 h-1.5 bg-slate-100 w-full">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${mission.progressPercent}%` }}
                          className={`h-full ${statusColor}`}
                        />
                     </div>

                     <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-900 group-hover:bg-cyan-50 transition-all">
                              <Globe className="w-7 h-7 text-cyan-600" />
                           </div>
                           <div>
                              <h3 className="text-xl font-black uppercase tracking-tighter italic leading-tight">{mission.trek.title}</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Location: {mission.currentLocationName || 'Stationary'}</p>
                           </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${statusColor} text-white text-[9px] font-black uppercase tracking-widest animate-pulse`}>
                           {latestSitrep?.status || 'NORMAL'}
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-6 mb-8 pt-6 border-t border-slate-100">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Altitude</p>
                           <p className="text-xl font-black italic">{mission.currentAltitude}m</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                           <p className="text-xl font-black italic">{mission.progressPercent}%</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Team Leader</p>
                           <p className="text-sm font-bold truncate">{mission.trek.guide?.name || 'Assigned'}</p>
                        </div>
                     </div>

                     {/* LATEST Status Update SNIPPET */}
                     {latestSitrep ? (
                        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 mb-4">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                 <Wind className="w-3.5 h-3.5 text-cyan-600" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Latest Status Update</span>
                              </div>
                              <span className="text-[9px] font-mono text-slate-400">{mounted ? formatDateTime(latestSitrep.createdAt) : '---'}</span>
                           </div>
                           <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                              "{latestSitrep.weather || 'No weather logged.'} | {latestSitrep.healthSummary || 'Health nominal.'}"
                           </p>
                        </div>
                     ) : (
                        <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-3xl mb-4">
                           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Status Update filed in this sector</p>
                        </div>
                     )}

                     {/* CHECKLIST COMPLIANCE */}
                     <div className="flex gap-2">
                        {mission.checklists.length > 0 ? (
                           mission.checklists.map((cl, i) => (
                              <div key={i} title={cl.phase} className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                 <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              </div>
                           ))
                        ) : (
                           <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Awaiting Verification</span>
                           </div>
                        )}
                     </div>
                  </motion.div>
               );
            })}
         </AnimatePresence>
      </div>

      {filteredMissions.length === 0 && (
         <div className="py-40 flex flex-col items-center justify-center text-slate-300 grayscale opacity-40">
            <Globe className="w-20 h-20 mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.3em]">No Active Treks Found</p>
         </div>
      )}
    </div>
  );
}
