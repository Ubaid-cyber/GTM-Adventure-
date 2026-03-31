'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

export default function MedicalReviewDashboard() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<MedicalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/medical')
      .then(res => res.json())
      .then(data => {
        setProfiles(data);
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
    if (!window.confirm('Delete this medical record permanently? This will remove the trekker from your active records.')) return;
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
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="relative group">
        <div className="w-32 h-32 border border-cyan-500/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
        <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">System Boot</span>
          <div className="w-12 h-0.5 bg-slate-900 overflow-hidden">
            <div className="w-full h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      ` }} />
    </div>
  );

  return (
    <div className="min-h-screen text-slate-400 font-sans selection:bg-cyan-500/30 py-8 px-6 lg:px-12">
      <div className="max-w-[1700px] mx-auto space-y-12">
        
        {/* Clinical Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-slate-900 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-cyan-500">
              <div className="p-2 border border-cyan-500/30 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944z"/>
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Auth: MEDICAL REVIEW OFFICER</p>
            </div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              Admin
              <span className="text-slate-800">/</span>
              <span className="text-cyan-500/80">Medical</span>
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Service: GTM-MED-01</span>
              <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
              <span>Secure Layer: Encrypted</span>
              <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
              <span className="text-cyan-500/50">Active Syncing...</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center gap-4 group hover:border-cyan-500/30 transition-all cursor-crosshair">
              <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">System Status: Stable</span>
            </div>
            <button className="w-12 h-12 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:border-cyan-500 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          </div>
        </div>

        {/* Tactical Telemetry Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Awaiting Review', val: Array.isArray(profiles) ? profiles.filter(p => p.status === 'AWAITING_CLEARANCE').length : 0, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
            { label: 'In Medical Review', val: Array.isArray(profiles) ? profiles.filter(p => p.status === 'IN_REVIEW').length : 0, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
            { label: 'Approved Trekkers', val: Array.isArray(profiles) ? profiles.filter(p => p.status === 'CLEARED').length : 0, color: 'text-cyan-500', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20' },
            { label: 'Total Records', val: Array.isArray(profiles) ? profiles.length : 0, color: 'text-white', bg: 'bg-slate-900/40', border: 'border-slate-800' }
          ].map((stat, idx) => (
            <div key={idx} className={`relative p-8 rounded-2xl border ${stat.border} ${stat.bg} group overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-current rounded-full animate-ping"></div>
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
              <p className={`text-6xl font-mono font-black ${stat.color} tracking-tighter`}>
                {stat.val.toString().padStart(2, '0')}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color.replace('text', 'bg')} opacity-40`} style={{ width: '60%' }}></div>
                </div>
                <span className="text-[8px] font-black text-slate-600 font-mono italic">NORM_LEVEL</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Tactical Table HUD */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="px-10 py-8 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Health Records</h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Trekker Health Verification</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filter Mode:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
                <button className="px-4 py-1.5 bg-slate-900 text-cyan-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Priority</button>
                <button className="px-4 py-1.5 text-slate-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Alphabetical</button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-900/40">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-900">Trekker Details</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-900">Medical History</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-900">Health Vitals</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-900 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {Array.isArray(profiles) && profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-cyan-500/[0.02] transition-colors group relative">
                    <td className="px-10 py-12 relative overflow-hidden">
                      {profile.status === 'IN_REVIEW' && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 animate-pulse"></div>
                      )}
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col items-center justify-center group-hover:border-cyan-500/30 transition-colors">
                          <span className="text-xl font-black text-white">{profile.user.name.charAt(0).toUpperCase()}</span>
                          <span className="text-[8px] font-bold text-slate-700 mt-0.5">Sub-ID</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-black text-white tracking-tighter uppercase">{profile.user.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-mono font-bold text-slate-500 italic lowercase">{profile.user.email}</p>
                            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Update: {new Date(profile.updatedAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-12">
                      <div className="flex flex-wrap gap-2 max-w-[340px]">
                        {Object.entries(profile.history || {}).map(([key, value]) => {
                          if (key === 'other' && typeof value === 'string' && value.length > 0) {
                            return (
                              <div key={key} className="w-full mt-3 p-4 bg-rose-500/[0.03] border border-rose-500/10 rounded-xl group/note relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/30"></div>
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] block mb-1">Medical Note</span>
                                <p className="text-[11px] text-rose-200/70 font-mono leading-relaxed italic line-clamp-2">"{value}"</p>
                              </div>
                            );
                          }
                          return (
                            value === true && (
                              <span key={key} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:border-rose-500/20 transition-all">
                                [ {key.replace('hypertension', 'High_BP')} ]
                              </span>
                            )
                          )
                        })}
                        {Object.values(profile.history || {}).every(v => v === false || v === '') && (
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] italic">No Anomalies Detected</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-12">
                       <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-1">
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Systematic_BP</p>
                            <p className="text-white font-mono font-black text-sm">{profile.vitals?.bp || '00/00'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Hemo_Profile</p>
                            <p className="text-cyan-400 font-mono font-black text-sm">{profile.vitals?.bloodGroup || 'UNK'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Bio_Mass</p>
                            <p className="text-white font-mono font-black text-sm">{profile.vitals?.weight}kg</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Altitude_Cap</p>
                            <p className="text-cyan-400 font-mono font-black text-sm text-[10px] uppercase">Validated</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-12 text-right">
                      <div className="space-y-6 max-w-[400px] ml-auto">
                        <div className="flex items-center justify-end gap-3">
                           {profile.status === 'CLEARED' && (
                             <div className="flex items-center gap-2 group/status">
                               <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">Approved</span>
                               <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                             </div>
                           )}
                           {profile.status === 'IN_REVIEW' && (
                             <div className="flex items-center gap-2 group/status">
                               <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">In Review</span>
                               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                             </div>
                           )}
                           {profile.status === 'AWAITING_CLEARANCE' && (
                             <div className="flex items-center gap-2 group/status">
                               <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Pending Review</span>
                               <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                             </div>
                           )}
                        </div>
                        <div className="flex items-center justify-end gap-3">
                           <button 
                             onClick={() => updateStatus(profile.id, 'IN_REVIEW')}
                             className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest disabled:opacity-30"
                             disabled={updatingId === profile.id}
                           >
                             Start Review
                           </button>
                           <button 
                             onClick={() => updateStatus(profile.id, 'CLEARED')}
                             className="px-6 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 rounded-xl text-[10px] font-black transition-all active:scale-95 uppercase tracking-widest disabled:opacity-30"
                             disabled={updatingId === profile.id}
                           >
                             Approve
                           </button>
                        </div>

                        {/* Tactical Note and Terminate Action */}
                        <div className="flex items-center gap-3 pt-6 border-t border-slate-900">
                           <textarea 
                              key={profile.id}
                              defaultValue={profile.medicalNotes || ''}
                              onBlur={(e) => updateStatus(profile.id, profile.status, e.target.value)}
                              placeholder="Surgeon's Clinical Analysis Notes..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-mono font-bold text-slate-400 focus:border-cyan-500/50 outline-none h-14 resize-none transition-all placeholder:text-slate-800"
                           />
                           <button 
                             onClick={() => deleteProfile(profile.id)}
                             className="w-14 h-14 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-500/60 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all group/terminate shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                             title="Terminate Mission Protocol"
                             disabled={updatingId === profile.id}
                           >
                              <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                           </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!Array.isArray(profiles) || profiles.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-40">
                        <div className="relative">
                          <div className="w-20 h-20 border border-slate-800 rounded-full animate-[spin_10s_linear_infinite]"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1 h-3 bg-cyan-500/20"></div>
                          </div>
                        </div>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                          Channel Secured<br/>No Active Signals Detected
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
