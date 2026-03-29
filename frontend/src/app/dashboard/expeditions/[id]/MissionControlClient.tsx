'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SocialLedger from './SocialLedger';
import Roster from './Roster';

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
  };
}

export default function MissionControlClient({ expeditionId }: { expeditionId: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<ExpeditionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'ledger' | 'roster'>('telemetry');

  useEffect(() => {
    async function fetchExpedition() {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expeditions/${expeditionId}`, {
          headers: { 'x-user-email': 'bhatubaid341@gmail.com' }
        });
        const result = await res.json();
        if (res.ok) {
          setData(result);
        } else {
          setError(result.error || 'Failed to load expedition telemetry.');
        }
      } catch (err) {
        setError('Connection to Mission Control lost.');
      } finally {
        setLoading(false);
      }
    }
    
    if (session?.user?.email) {
      fetchExpedition();
    }
  }, [expeditionId, session?.user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-primary font-mono text-sm tracking-widest uppercase animate-pulse">Establishing Satellite Uplink...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Signal Lost</h1>
        <p className="text-muted mb-8 text-center">{error}</p>
        <Link href="/dashboard/bookings" className="text-primary font-bold hover:underline">Return to Basecamp</Link>
      </div>
    );
  }

  const isOngoing = data.status === 'ONGOING';

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 selection:bg-primary selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${isOngoing ? 'bg-primary text-white shadow-[0_0_15px_rgba(30,58,138,0.5)]' : 'bg-gray-800 text-gray-400'}`}>
                {data.status}
              </span>
              <span className="text-primary/50 font-mono text-xs">UPLINK_SECURE_MODE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{data.trek.title}</h1>
            <p className="text-muted text-sm font-medium opacity-60">Expedition Alpha-1 // Monitoring {data.trek.durationDays} Days Duration</p>
          </div>
          
          <div className="flex gap-4">
             <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Time Elapsed</div>
                <div className="text-2xl font-mono font-bold tracking-tighter">04:12:35</div>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Heart Rate</div>
                <div className="text-2xl font-mono font-bold tracking-tighter text-emerald-400">72 BPM</div>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mb-10 gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'telemetry', label: 'Telemetry HUD', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'ledger', label: 'Social Ledger', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
            { id: 'roster', label: 'Personnel Roster', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' }
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
            <AnimatePresence mode="wait">
              {activeTab === 'telemetry' && (
                <motion.div
                  key="telemetry"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Progress Visualization */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-white/20">SYSTEM_ID: X-992</div>
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                      Route Progress
                    </h3>
                    
                    <div className="relative mb-8">
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${data.progressPercent}%` }}
                           transition={{ duration: 2, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_20px_rgba(30,58,138,0.4)]"
                         />
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className="text-center">
                          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Start</div>
                          <div className="text-sm font-bold">Basecamp</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Status</div>
                          <div className="text-xl font-black">{data.progressPercent}% Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Summit</div>
                          <div className="text-sm font-bold">Peak High</div>
                        </div>
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                      <div>
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1">Altitude</div>
                        <div className="text-2xl font-black">{data.currentAltitude || '---'} <span className="text-xs text-primary">m</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1">Current Base</div>
                        <div className="text-xl font-bold truncate">{data.currentLocationName || 'Stationary'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1">Latitude</div>
                        <div className="text-lg font-mono font-bold">{data.currentLat?.toFixed(4) || '---'} N</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted font-bold uppercase tracking-tighter mb-1">Longitude</div>
                        <div className="text-lg font-mono font-bold">{data.currentLong?.toFixed(4) || '---'} E</div>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Live Feed */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                     <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold flex items-center gap-2">
                         <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                         Live Satellite Data Stream
                       </h3>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Live</span>
                       </div>
                     </div>
                     <div className="space-y-3 font-mono text-[11px] text-white/60">
                       <div className="flex gap-4"><span className="text-primary">00:00:23</span> <span>SYSLOG [OK] ... Initializing GPR connection to GTM_SAT_4</span></div>
                       <div className="flex gap-4"><span className="text-primary">00:01:05</span> <span>SIGNAL_INTENSITY: 98.4% (KU_BAND)</span></div>
                       <div className="flex gap-4"><span className="text-primary">00:02:11</span> <span className="text-emerald-400 italic">LOCATION_UPDATE: Namche Bazaar check-point cleared.</span></div>
                       <div className="flex gap-4 animate-pulse"><span className="text-primary">00:05:12</span> <span className="text-white">WAITING_FOR_TELEMETRY_PACKET_94...</span></div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ledger' && (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SocialLedger expeditionId={expeditionId} />
                </motion.div>
              )}

              {activeTab === 'roster' && (
                <motion.div
                  key="roster"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Roster expeditionId={expeditionId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-primary/20 border border-primary/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(30,58,138,0.2)]">
                <h4 className="text-sm font-black uppercase tracking-widest mb-6">Expedition Tools</h4>
                <div className="space-y-4">
                  <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    Sync Health Tracker
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Emergency Protocol
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Mission Log
                  </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               <h4 className="text-sm font-black uppercase tracking-widest mb-6">Summit Details</h4>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                     </div>
                     <div>
                       <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Target Alt</div>
                       <div className="text-lg font-extrabold">{data.trek.maxAltitude}m</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                     </div>
                     <div>
                       <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Expected Return</div>
                       <div className="text-lg font-extrabold">12 April</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
