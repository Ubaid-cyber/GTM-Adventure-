'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Calendar, ArrowRight, ShieldCheck, Map } from 'lucide-react';

interface TrekkerDashboardProps {
  user: any;
  apiToken: string;
}

export function TrekkerDashboard({ user, apiToken }: TrekkerDashboardProps) {
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/active-bookings`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'x-user-email': user.email
          }
        });
        if (res.ok) {
          const data = await res.json();
          setActiveMissions(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to fetch missions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, [user.email, apiToken]);

  return (
    <div className="space-y-10">
      {/* 🚀 MISSION LAUNCHPAD */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-end justify-between px-2">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
              Mission <span className="text-primary">Launchpad</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">Active and upcoming expeditions for {user.name}</p>
          </div>
          <Link href="/treks" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b-2 border-primary/20 pb-0.5 hover:border-primary transition-all">
            Explore More Missions
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl border border-slate-200"></div>
            ))}
          </div>
        ) : activeMissions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {activeMissions.map((mission, idx) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-200 p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all flex flex-col md:flex-row items-center gap-8"
              >
                <div className="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <Compass className="w-10 h-10" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-primary border border-blue-100 rounded-full text-[9px] font-black uppercase tracking-widest">{mission.status}</span>
                    <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest">Sector: {mission.expeditionId.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">{mission.expedition?.trek?.title || 'Unknown Expedition'}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-slate-500">
                    <div className="flex items-center gap-1.5 ">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(mission.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Map className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Himalayan Base</span>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/dashboard/treks/${mission.expeditionId}`}
                  className="w-full md:w-auto bg-slate-900 group-hover:bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-900/10 group-hover:shadow-primary/20"
                >
                  Launch Mission Control
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase italic">No Active Missions Found</h3>
            <p className="text-sm text-slate-500 mt-2 mb-8">You haven't launched any expeditions yet. Discover your next adventure.</p>
            <Link href="/treks" className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              Search Expeditions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
