'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, MapPin, Activity, Navigation, 
  ChevronRight, RefreshCcw, X, Check, Save,
  CloudOff, Cloud, Wind, Thermometer, ClipboardList,
  AlertTriangle, CheckCircle2, Info, Heart, Lock
} from 'lucide-react';
import GroupChat from './GroupChat';
import GroupMembers from './GroupMembers';
import { 
  getExpeditionTelemetryAction, 
  updateExpeditionTelemetryAction, 
  postSitrepAction, 
  updateChecklistAction 
} from '@/lib/actions/leader-actions';

interface ExpeditionData {
  id: string;
  status: string;
  currentLocationName: string | null;
  currentAltitude: number | null;
  currentLat: number | null;
  currentLong: number | null;
  progressPercent: number;
  trek: {
    title: string;
    maxAltitude: number;
    durationDays: number;
    guideId: string | null;
  };
}

export default function TrekCommandCenterClient({ 
  expeditionId, 
  isLeader
}: { 
  expeditionId: string, 
  isLeader: boolean
}) {
  const { data: session } = useSession();
  const [data, setData] = useState<ExpeditionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'progress' | 'chat' | 'members'>('progress');
  const [showLeaderHud, setShowLeaderHud] = useState(false);
  const [hudTab, setHudTab] = useState<'TELEMETRY' | 'SITREP' | 'CHECKLIST'>('TELEMETRY');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Telemetry Form State
  const [telemetry, setTelemetry] = useState({
    currentLocationName: '',
    currentAltitude: 0,
    progressPercent: 0
  });

  // SITREP Form State
  const [sitrep, setSitrep] = useState({
    status: 'GREEN',
    weather: '',
    healthSummary: '',
    safetyNotes: ''
  });

  // 📡 OFFLINE SYNC ENGINE
  const [pendingUpdates, setPendingUpdates] = useState<any[]>([]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchExpedition = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const result = await getExpeditionTelemetryAction(expeditionId);
      if (result) {
        setData(result);
        setTelemetry({
          currentLocationName: result.currentLocationName || '',
          currentAltitude: result.currentAltitude || 0,
          progressPercent: result.progressPercent || 0
        });
      } else {
        setError('Failed to load expedition telemetry.');
      }
    } catch (err) {
      setError('Failed to connect to expedition service.');
    } finally {
      setLoading(false);
    }
  }, [expeditionId, session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchExpedition();
    }
  }, [fetchExpedition, session?.user?.email]);

  // SYNC QUEUE ON RECONNECT
  useEffect(() => {
    if (isOnline && pendingUpdates.length > 0) {
      const syncUpdates = async () => {
         console.log('📡 Reconnected. Syncing operational queue...');
         for (const update of pendingUpdates) {
            try {
               await updateExpeditionTelemetryAction(expeditionId, update);
            } catch (err) {
               console.error('Sync failed for update:', update);
            }
         }
         setPendingUpdates([]);
         fetchExpedition();
      };
      syncUpdates();
    }
  }, [isOnline, pendingUpdates, expeditionId, fetchExpedition]);

  const handleUpdateTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email || !data) return;

    if (!isOnline) {
       setPendingUpdates([...pendingUpdates, telemetry]);
       alert('⚠️ Sync Status: Connection lost. Update queued for cloud sync.');
       setShowLeaderHud(false);
       return;
    }

    setIsUpdating(true);
    try {
      const result = await updateExpeditionTelemetryAction(expeditionId, telemetry);

      if (result.success) {
        await fetchExpedition();
        setShowLeaderHud(false);
      } else {
        alert(result.error || 'Failed to update telemetry');
      }
    } catch (err) {
      console.error('Update Error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePostSitrep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email || !isOnline) return;
    setIsUpdating(true);
    try {
       const result = await postSitrepAction({ ...sitrep, expeditionId });
       if (result.success) {
          alert('✅ SITREP logged successfully. Logged in Command Center.');
          setShowLeaderHud(false);
       } else {
          alert(result.error || 'SITREP Submission Failed');
       }
    } catch (err) {
       console.error('SITREP Error:', err);
    } finally {
       setIsUpdating(false);
    }
  };

  const handleChecklistSubmit = async (phase: string) => {
     if (!isOnline) return;
     try {
        const result = await updateChecklistAction(expeditionId, phase);
        if (result.success) fetchExpedition();
     } catch (err) {
        console.error('Checklist Error:', err);
     }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-primary font-mono text-sm tracking-widest uppercase animate-pulse">Establishing Connection...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Signal Lost</h1>
        <p className="text-muted mb-8 text-center">{error}</p>
        <Link href="/dashboard" className="text-primary font-bold hover:underline">Go back to Dashboard</Link>
      </div>
    );
  }

  const user = session?.user as any;
  const isOngoing = data.status === 'ONGOING';

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 selection:bg-primary selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-sm text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${isOngoing ? 'bg-primary text-white shadow-[0_0_15px_rgba(30,58,138,0.5)]' : 'bg-gray-800 text-gray-400'}`}>
                {data.status}
              </span>
              <span className="text-primary/50 font-mono text-[10px] md:text-xs tracking-tighter">COMMAND_CENTER_V2.1 // {isOnline ? 'SIGNAL_NOMINAL' : 'OFFLINE_MODE'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 leading-none">{data.trek.title}</h1>
            <p className="text-muted text-[11px] md:text-sm font-medium opacity-60 italic">Operational Sector // Height: {data.trek.maxAltitude}m</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             {isLeader && (
               <button 
                 onClick={() => setShowLeaderHud(true)}
                 className="flex-1 md:flex-none p-3 md:p-4 bg-cyan-600/10 border border-cyan-500/30 rounded-xl backdrop-blur-sm group hover:bg-cyan-600 transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)]"
               >
                  <div className="text-[9px] md:text-[10px] font-bold text-cyan-400 group-hover:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                     <Shield className="w-3 h-3" /> Trip Support
                  </div>
                  <div className="text-sm font-bold tracking-tighter">Leader Control Panel</div>
               </button>
             )}
             <div className="flex-1 md:flex-none p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Time on Route</div>
                <div className="text-xl md:text-2xl font-mono font-bold tracking-tighter">Day : 04</div>
             </div>
             <div className="flex-1 md:flex-none p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">System Status</div>
                <div className="text-xl md:text-2xl font-mono font-bold tracking-tighter text-emerald-400">NOMINAL</div>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mb-8 md:mb-10 gap-6 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'progress', label: 'Trek Progress', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'chat', label: 'Group Chat', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
            { id: 'members', label: 'Group Members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}/></svg>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(30,58,138,0.8)]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 min-h-[600px]">
             {/* 🛰️ OFFLINE ALERT */}
             {!isOnline && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 text-amber-500"
               >
                  <CloudOff className="w-5 h-5" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Protocol: Satellite Connection Lost // Local Caching Enabled</p>
               </motion.div>
             )}

            <AnimatePresence mode="wait">
              {activeTab === 'progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Progress Visualization */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-white/20">TRK_ID: {expeditionId.slice(0,8)}</div>
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                       <Navigation className="w-5 h-5 text-primary" />
                       Route Progress
                    </h3>
                    
                    <div className="relative mb-8">
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.5)]">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${data.progressPercent}%` }}
                           transition={{ duration: 2, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_20px_rgba(30,58,138,0.4)]"
                         />
                      </div>
                       <div className="flex justify-between mt-4">
                        <div className="text-center">
                          <div className="text-[9px] md:text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Origin</div>
                          <div className="text-[12px] md:text-sm font-bold uppercase text-white/40 italic">Start Point</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] md:text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Distance Covered</div>
                          <div className="text-sm md:text-xl font-black italic">{data.progressPercent}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] md:text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Target</div>
                          <div className="text-[12px] md:text-sm font-bold text-white/40 italic">Summit</div>
                        </div>
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                      <div className="group/stat">
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1 group-hover/stat:text-primary transition-colors">Total Height</div>
                        <div className="text-2xl font-black tracking-tighter italic">{data.currentAltitude || '---'} <span className="text-xs text-primary not-italic">m</span></div>
                      </div>
                      <div className="group/stat">
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1 group-hover/stat:text-primary transition-colors">Current Base</div>
                        <div className="text-xl font-bold truncate italic">{data.currentLocationName || 'In Transit'}</div>
                      </div>
                      <div className="group/stat">
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1 group-hover/stat:text-primary transition-colors">Latitude</div>
                        <div className="text-lg font-mono font-bold text-white/60">{data.currentLat?.toFixed(4) || '---'}</div>
                      </div>
                      <div className="group/stat">
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1 group-hover/stat:text-primary transition-colors">Longitude</div>
                        <div className="text-lg font-mono font-bold text-white/60">{data.currentLong?.toFixed(4) || '---'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Satellite Log */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                           <Activity className="w-5 h-5 text-emerald-400" />
                           Activity Log
                        </h3>
                       <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                          <span className={`text-[10px] font-mono ${isOnline ? 'text-emerald-400' : 'text-amber-400'} font-bold uppercase tracking-widest`}>{isOnline ? 'Active' : 'Offline'}</span>
                       </div>
                     </div>
                     <div className="space-y-3 font-mono text-[11px] text-white/40">
                       <div className="flex gap-4"><span className="text-primary/60">00:00:23</span> <span>Handshake with main network...</span></div>
                       <div className="flex gap-4"><span className="text-primary/60">00:01:05</span> <span>Signal strength: {isOnline ? '99.1%' : '0%'}</span></div>
                       <div className="flex gap-4"><span className="text-primary/60">00:02:11</span> <span className="text-emerald-400 italic">Base update protocol: Ready.</span></div>
                       {!isOnline && <div className="flex gap-4 animate-pulse"><span className="text-amber-500">ERROR_404</span> <span className="text-amber-400 font-black">Satellite link severed. Queueing updates.</span></div>}
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <GroupChat expeditionId={expeditionId} />
                </motion.div>
              )}

              {activeTab === 'members' && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <GroupMembers 
                    expeditionId={expeditionId} 
                    isLeader={(session?.user as any)?.role === 'LEADER'} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-primary/20 border border-primary/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(30,58,138,0.2)]">
                <h4 className="text-sm font-black uppercase tracking-widest mb-6">Trek Tools</h4>
                <div className="space-y-4">
                  <button className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3 italic">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Update My Health
                  </button>
                  <button className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3 italic">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Emergency SOS
                  </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               <h4 className="text-sm font-black uppercase tracking-widest mb-6">Trek Details</h4>
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-emerald-400">
                     <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Trek Height</div>
                       <div className="text-xl font-black italic tracking-tighter">{data.trek.maxAltitude} <span className="text-xs not-italic uppercase opacity-30">m</span></div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                        <Activity className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Trek Duration</div>
                       <div className="text-xl font-black italic tracking-tighter">{data.trek.durationDays} <span className="text-xs not-italic uppercase opacity-30">Days</span></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 LEADER HUD: MISSION CONTROL MODAL */}
      <AnimatePresence>
        {showLeaderHud && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 50 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 50 }}
               className="bg-[#050505] border border-cyan-500/30 w-full max-w-3xl rounded-[48px] overflow-hidden shadow-[0_0_120px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh]"
             >
                {/* HUD HEADER */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-cyan-600/5">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-cyan-600/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center shadow-inner">
                         <Shield className="w-7 h-7 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">Command Hub</h3>
                        <p className="text-2xl font-black uppercase tracking-tighter italic leading-none">Operational Payload Dashboard</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowLeaderHud(false)}
                     className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:rotate-90 transition-transform duration-500"
                   >
                      <X className="w-6 h-6 text-white/40" />
                   </button>
                </div>

                {/* HUD NAVIGATION */}
                <div className="flex p-2 bg-white/5 border-b border-white/10">
                   {[
                     { id: 'TELEMETRY', label: 'Telemetry', icon: Navigation },
                     { id: 'SITREP', label: 'SITREP Submission', icon: Wind },
                     { id: 'CHECKLIST', label: 'Safety Checklists', icon: ClipboardList }
                   ].map(tab => (
                     <button 
                       key={tab.id}
                       onClick={() => setHudTab(tab.id as any)}
                       className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${hudTab === tab.id ? 'bg-cyan-600 text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}
                     >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                     </button>
                   ))}
                </div>

                {/* HUD CONTENT */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                   
                   {/* 📐 TAB: TELEMETRY */}
                   {hudTab === 'TELEMETRY' && (
                     <form onSubmit={handleUpdateTelemetry} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1 italic">Current Operational Sector</label>
                              <div className="relative group">
                                 <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                                 <input 
                                   type="text" 
                                   value={telemetry.currentLocationName}
                                   onChange={(e) => setTelemetry({...telemetry, currentLocationName: e.target.value})}
                                   placeholder="e.g. Namche Bazaar"
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-sm font-bold outline-none focus:border-cyan-500/40 transition-all shadow-inner"
                                 />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1 italic">Altitude Clearance (m)</label>
                              <div className="relative group">
                                 <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                                 <input 
                                   type="number" 
                                   value={telemetry.currentAltitude}
                                   onChange={(e) => setTelemetry({...telemetry, currentAltitude: parseInt(e.target.value)})}
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-sm font-bold outline-none focus:border-cyan-500/40 transition-all font-mono"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-8 bg-white/5 p-8 rounded-[32px] border border-white/5">
                           <div className="flex justify-between items-end">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 italic">Platform Progress Sync</label>
                              <span className="text-4xl font-black text-cyan-400 font-mono tracking-tighter italic">{telemetry.progressPercent}%</span>
                           </div>
                           <input 
                             type="range" 
                             min="0"
                             max="100"
                             value={telemetry.progressPercent}
                             onChange={(e) => setTelemetry({...telemetry, progressPercent: parseInt(e.target.value)})}
                             className="w-full h-2.5 bg-cyan-900/30 rounded-full appearance-none cursor-pointer accent-cyan-500"
                           />
                           <div className="flex justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.4em] font-mono">
                              <span>BASE_DEPARTURE</span>
                              <span>PEAK_SUMMIT</span>
                           </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={isUpdating}
                          className="w-full py-6 bg-cyan-600 text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 italic"
                        >
                           {isUpdating ? (
                              <RefreshCcw className="w-5 h-5 animate-spin" />
                           ) : (
                              <>Transmit Operational Telemetry <Zap className="w-5 h-5 fill-white" /></>
                           )}
                        </button>
                     </form>
                   )}

                   {/* 📡 TAB: SITREP */}
                   {hudTab === 'SITREP' && (
                     <form onSubmit={handlePostSitrep} className="space-y-10">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1 italic">Situation Status</label>
                           <div className="grid grid-cols-3 gap-4">
                              {[
                                { id: 'GREEN', label: 'Nominal', color: 'bg-emerald-500' },
                                { id: 'AMBER', label: 'Warning', color: 'bg-amber-500' },
                                { id: 'RED', label: 'EMERGENCY', color: 'bg-rose-500' }
                              ].map(st => (
                                <button 
                                  key={st.id}
                                  type="button"
                                  onClick={() => setSitrep({...sitrep, status: st.id})}
                                  className={`py-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${sitrep.status === st.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5 text-white/40'}`}
                                >
                                   <div className={`w-3 h-3 rounded-full ${st.color} ${sitrep.status === st.id ? 'animate-pulse' : ''}`}></div>
                                   <span className="text-[10px] font-black uppercase tracking-widest">{st.label}</span>
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1 italic">Weather Observation</label>
                              <div className="relative">
                                 <Cloud className="absolute left-6 top-6 w-4 h-4 text-cyan-500" />
                                 <textarea 
                                   value={sitrep.weather}
                                   onChange={(e) => setSitrep({...sitrep, weather: e.target.value})}
                                   placeholder="Visibility, Wind, Temp..."
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 pt-5 pb-5 text-sm font-bold outline-none focus:border-cyan-500/40 transition-all min-h-[140px] resize-none"
                                 />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block ml-1 italic">Health & Safety Brief</label>
                              <div className="relative">
                                 <Thermometer className="absolute left-6 top-6 w-4 h-4 text-cyan-500" />
                                 <textarea 
                                   value={sitrep.healthSummary}
                                   onChange={(e) => setSitrep({...sitrep, healthSummary: e.target.value})}
                                   placeholder="Team conditions, injuries, vital signs..."
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 pt-5 pb-5 text-sm font-bold outline-none focus:border-cyan-500/40 transition-all min-h-[140px] resize-none"
                                 />
                              </div>
                           </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={isUpdating || !isOnline}
                          className={`w-full py-6 rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 italic ${!isOnline ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 text-white shadow-cyan-900/40 hover:scale-[1.02]'}`}
                        >
                           {!isOnline ? <>Offline: Sat-Link Required <CloudOff className="w-5 h-5" /></> : <>Authorize SITREP Transmission <RefreshCcw className="w-5 h-5" /></>}
                        </button>
                     </form>
                   )}

                   {/* ✅ TAB: CHECKLIST */}
                   {hudTab === 'CHECKLIST' && (
                     <div className="space-y-10">
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-[32px] p-8 space-y-4">
                           <div className="flex items-center gap-3">
                              <Info className="w-5 h-5 text-cyan-400" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Security Note</p>
                           </div>
                           <p className="text-xs text-white/60 leading-relaxed italic">The following checklists are mandatory for operational safety. Verification is timestamped and audited by higher command.</p>
                        </div>

                        <div className="space-y-6">
                           {[
                              { id: 'PRE_DEPARTURE', label: 'Phase 01: Pre-Departure Check', desc: 'Equipment, Supplies, and Team Readiness', icon: Navigation },
                              { id: 'BASE_CAMP_ARRIVAL', label: 'Phase 02: Base Camp Logistics', desc: 'Medical Check and Acclimatization', icon: MapPin },
                              { id: 'CAMP_1_ARRIVAL', label: 'Phase 03: High Altitude Prep', desc: 'Technical Gear and Oxygen Verification', icon: Zap },
                              { id: 'SUMMIT_PUSH', label: 'Phase 04: Summit Operations', desc: 'Window Confirmation and Safety Hold', icon: Shield }
                           ].map((phase, i) => (
                             <div key={phase.id} className="relative group">
                                <div className="absolute -left-5 top-0 bottom-0 w-px bg-white/10 group-last:bottom-1/2"></div>
                                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between group-hover:bg-cyan-600/5 group-hover:border-cyan-500/30 transition-all">
                                   <div className="flex items-center gap-6">
                                      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl font-black text-cyan-500 italic">
                                         0{i+1}
                                      </div>
                                      <div>
                                         <h4 className="text-sm font-black uppercase italic tracking-tighter">{phase.label}</h4>
                                         <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{phase.desc}</p>
                                      </div>
                                   </div>
                                   <button 
                                     onClick={() => handleChecklistSubmit(phase.id)}
                                     className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyan-600 hover:text-white transition-all flex items-center gap-2 group/btn"
                                   >
                                      Verify Phase <CheckCircle2 className="w-4 h-4 text-cyan-500 group-hover/btn:text-white" />
                                   </button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                </div>

                {/* HUD FOOTER */}
                <div className="px-10 py-6 bg-cyan-600/5 border-t border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'} animate-pulse`}></div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                         Protocol {isOnline ? 'Active' : 'Offline Mode'}: Integrity Nominal // Latency: 42ms
                      </p>
                   </div>
                   {pendingUpdates.length > 0 && (
                     <div className="flex items-center gap-2 text-rose-400 animate-pulse">
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{pendingUpdates.length} Payload(s) Queued for Sync</span>
                     </div>
                   )}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
