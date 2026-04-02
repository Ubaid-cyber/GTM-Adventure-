'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertCircle, Trash2, CheckCircle, Search, Filter } from 'lucide-react';
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
  }
}

export const MedicalDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<MedicalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/medical')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProfiles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (profileId: string, newStatus: string, medicalNotes?: string) => {
    setUpdatingId(profileId);
    try {
      const res = await fetch('/api/admin/medical', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, status: newStatus, medicalNotes })
      });
      if (res.ok) {
        setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status: newStatus as any, medicalNotes } : p));
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!window.confirm('Delete this medical record permanently?')) return;
    setUpdatingId(profileId);
    try {
      const res = await fetch('/api/admin/medical', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId })
      });
      if (res.ok) {
        setProfiles(prev => prev.filter(p => p.id !== profileId));
      }
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-pulse">
       <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4" />
       <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Calibrating Telemetry...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* HEADER: MEDICAL HUD IDENTITY */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/10 pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-cyan-600">
             <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-cyan-600" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Auth: MEDICAL REVIEW OFFICER</p>
          </div>
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4 italic">
             Medical <span className="text-cyan-600/80">Oversight</span>
          </h1>
          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                Status: Operational
             </span>
             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span>Secure Sync Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-cyan-500/30 transition-all">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Verified Hub</span>
           </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Approval', val: profiles.filter(p => p.status === 'AWAITING_CLEARANCE').length, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'In Examination', val: profiles.filter(p => p.status === 'IN_REVIEW').length, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Cleared Personnel', val: profiles.filter(p => p.status === 'CLEARED').length, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Total Records', val: profiles.length, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-100' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-8 rounded-[32px] border ${stat.border} ${stat.bg} relative overflow-hidden group`}>
             <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{stat.label}</p>
                <p className={`text-5xl font-black ${stat.color} tracking-tighter italic`}>{stat.val.toString().padStart(2, '0')}</p>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-24 h-24" />
             </div>
          </div>
        ))}
      </div>

      {/* TACTICAL TABLE */}
      <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                 <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Clinical Telemetry</h3>
           </div>
           <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <button className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">All Records</button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cleared</button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Personnel Profile</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Medical Evaluation</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action Integrity</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-10 py-10">
                          <div className="flex items-center gap-6">
                             <div className="w-[72px] h-[72px] rounded-3xl bg-slate-900 flex items-center justify-center text-2xl font-black text-white italic shadow-lg shadow-slate-900/20">
                                {profile.user.name.charAt(0).toUpperCase()}
                             </div>
                             <div className="space-y-1">
                                <p className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{profile.user.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest lowercase">{profile.user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-10">
                          <div className="flex flex-wrap gap-2">
                             {Object.entries(profile.history || {}).map(([key, value]) => (
                                value === true && (
                                   <span key={key} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                      {key.replace('hypertension', 'High BP')}
                                   </span>
                                )
                             ))}
                             <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 w-full">
                                <div className="flex justify-between items-center text-[10px] border-b border-slate-100 pb-2">
                                   <span className="font-bold text-slate-400 uppercase tracking-widest">BP:</span>
                                   <span className="font-black text-slate-900">{profile.vitals?.bp || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] border-b border-slate-100 pb-2">
                                   <span className="font-bold text-slate-400 uppercase tracking-widest">Mass:</span>
                                   <span className="font-black text-slate-900">{profile.vitals?.weight}kg</span>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-10">
                          <div className="flex flex-col gap-4 max-w-[280px]">
                             <div className="flex items-center gap-3">
                                <button
                                   onClick={() => updateStatus(profile.id, 'CLEARED')}
                                   disabled={updatingId === profile.id}
                                   className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
                                >
                                   Approve Profile
                                </button>
                                <button
                                   onClick={() => deleteProfile(profile.id)}
                                   disabled={updatingId === profile.id}
                                   className="w-12 h-12 flex items-center justify-center bg-slate-50 text-rose-500 border border-slate-100 rounded-2xl hover:bg-rose-50 transition-all"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                             <textarea 
                                defaultValue={profile.medicalNotes || ''}
                                onBlur={(e) => updateStatus(profile.id, profile.status, e.target.value)}
                                placeholder="Surgeon's Operational Notes..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-slate-900 outline-none h-16 resize-none focus:border-cyan-500/30 transition-all"
                             />
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
