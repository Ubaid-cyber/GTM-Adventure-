'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Search,
  ChevronRight,
  Trash2,
  FileText,
  AlertCircle,
  Stethoscope,
  ArrowUpRight,
  Filter,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';
import { 
  getAllMedicalProfiles, 
  updateMedicalNotesStatus, 
  resetMedicalClearance 
} from '@/lib/actions/admin-actions';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MedicalProfile {
  id: string;
  status: 'NONE' | 'AWAITING_CLEARANCE' | 'IN_REVIEW' | 'CLEARED';
  vitals: any;
  history: any;
  medicalNotes?: string;
  updatedAt: string;
  user: { name: string; email: string; profileImage?: string };
}

type FilterStatus = 'ALL' | 'AWAITING_CLEARANCE' | 'IN_REVIEW' | 'CLEARED';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  AWAITING_CLEARANCE: { label: 'Awaiting Review', color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  IN_REVIEW:          { label: 'Under Review',    color: 'text-blue-500',    bg: 'bg-blue-500/10'  },
  CLEARED:            { label: 'Cleared',         color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  NONE:               { label: 'Inactive',        color: 'text-white/20',    bg: 'bg-white/5'  },
};

export function MedicalDashboardView() {
  const [profiles, setProfiles] = useState<MedicalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await getAllMedicalProfiles();
      if (Array.isArray(data)) setProfiles(data as any);
    } catch (error) {
      console.error('Failed to sync with Medical Node:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      const res = await updateMedicalNotesStatus(id, status, notes);
      if (res.success) {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: status as any, medicalNotes: notes } : p));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = profiles.filter(p => {
    const matchStatus = filter === 'ALL' || p.status === filter;
    const matchSearch = !search || p.user.name.toLowerCase().includes(search.toLowerCase()) || p.user.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Loading medical records...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      
      {/* 🏥 Station Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
               <Activity className="w-5 h-5 text-blue-500" />
             </div>
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Expedition Management</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Medical Panel</h1>
          <p className="text-white/40 text-sm mt-2 max-w-xl font-medium">Review health status and grant medical clearance for upcoming trek expeditions.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl min-w-[140px]">
             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Queue Size</p>
             <p className="text-2xl font-black text-white leading-none">{profiles.filter(p => p.status === 'AWAITING_CLEARANCE').length}</p>
           </div>
           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl min-w-[140px]">
             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Cleared</p>
             <p className="text-2xl font-black text-emerald-500 leading-none">{profiles.filter(p => p.status === 'CLEARED').length}</p>
           </div>
        </div>
      </div>

      {/* 🔍 Filters & Intelligence Search */}
      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-3xl flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search trekker name or email..."
            className="w-full pl-12 pr-4 py-4 bg-transparent text-sm text-white placeholder:text-white/10 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl">
          {(['ALL', 'AWAITING_CLEARANCE', 'IN_REVIEW', 'CLEARED'] as FilterStatus[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/30 hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 📊 Profile Grids / Table */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((profile, idx) => {
            const sc = STATUS_MAP[profile.status] || STATUS_MAP.NONE;
            const isUpdating = updatingId === profile.id;
            const flags = Object.entries(profile.history || {}).filter(([, v]) => v === true).map(([k]) => k);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                key={profile.id}
                className="group relative bg-[#111] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.03] hover:border-white/10 transition-all shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <HeartPulse className="w-32 h-32 text-blue-500" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  
                  {/* Persona Block */}
                  <div className="flex items-center gap-5 min-w-[300px]">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl border-2 border-white/5 overflow-hidden bg-white/5 flex items-center justify-center">
                        {profile.user.profileImage ? (
                          <img src={profile.user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-white/20">{profile.user.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#111] ${sc.bg} flex items-center justify-center`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sc.color.replace('text', 'bg')}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors uppercase italic italic">
                        {profile.user.name}
                      </h3>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">{profile.user.email}</p>
                    </div>
                  </div>

                  {/* Vitals Dashboard */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Oxygen Sat %</p>
                      <p className="text-base font-black text-white">{profile.vitals?.oxygen || '98'}%</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Blood Pressure</p>
                      <p className="text-base font-black text-white">{profile.vitals?.bp || '120/80'}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-2xl border border-white/5 col-span-2">
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Clinical Indicators</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {flags.length > 0 ? flags.map(f => (
                          <span key={f} className="px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest">
                            {f === 'hypertension' ? 'HIGH-BP' : f}
                          </span>
                        )) : (
                          <span className="text-[10px] text-white/10 font-bold lowercase italic">no contraindications detected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Clinical Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
                    <div className="flex flex-col gap-1 pr-6 border-r border-white/5 hidden xl:flex">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${sc.color}`}>{sc.label}</span>
                        <span className="text-[9px] text-white/20 font-medium whitespace-nowrap">Updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                       {profile.status !== 'CLEARED' && (
                         <button
                           disabled={isUpdating}
                           onClick={() => updateStatus(profile.id, 'CLEARED')}
                           className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                         >
                           Approve
                         </button>
                       )}
                       {profile.status !== 'IN_REVIEW' && (
                         <button
                           disabled={isUpdating}
                           onClick={() => updateStatus(profile.id, 'IN_REVIEW')}
                           className="flex-1 sm:flex-none px-6 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                         >
                           Review
                         </button>
                       )}
                    </div>
                  </div>

                </div>

                {/* Dashboard Footer: Clinical Notes */}
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex items-center gap-2 text-white/20">
                    <FileText size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Health Review Notes</span>
                  </div>
                  <input 
                    type="text"
                    placeholder="Enter observation findings..."
                    defaultValue={profile.medicalNotes || ''}
                    onBlur={(e) => updateStatus(profile.id, profile.status, e.target.value)}
                    className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] text-white/10 font-black tracking-widest uppercase">ID: {profile.id.slice(-8)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px]">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-white/10" />
             </div>
             <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Awaiting Synchronization</h3>
             <p className="text-white/20 text-sm mt-2 max-w-xs mx-auto">All units are currently cleared or no records match your tactical filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}
