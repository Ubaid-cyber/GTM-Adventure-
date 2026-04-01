'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Compass, ChevronRight, Activity, Calendar, 
  MapPin, Zap, AlertCircle, Users, Globe, ExternalLink,
  Clipboard, Heart, Sliders, Search
} from 'lucide-react';
import Link from 'next/link';

interface LeaderDashboardProps {
  user: any;
}

export const LeaderDashboard: React.FC<LeaderDashboardProps> = ({ user }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchOperationalData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
          headers: { 
            'x-user-email': user.email,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) setBookings(data);
      } catch (err) {
        console.error('Operational Sync Failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperationalData();
  }, [user.email]);

  const filteredBookings = bookings.filter(b => 
    filter === 'ALL' || b.status === filter
  );

  return (
    <div className="space-y-12">
      {/* 🚀 ELITE MISSION CONTROL HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-[2px] bg-cyan-500"></div>
             <p className="text-[10px] font-black text-cyan-600/80 uppercase tracking-[0.5em]">Auth Level: Authorized Leader</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
             Executive <span className="text-cyan-600/90">Dashboard</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                Status: Operational
             </span>
             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span>Network: Secure Connection</span>
             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span className="flex items-center gap-2"><Globe className="w-3 h-3 text-cyan-500" /> Global View</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-[32px] shadow-sm">
           <div className="flex -space-x-3 ml-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white ring-2 ring-slate-50 flex items-center justify-center text-[10px] font-black italic">
                   {String.fromCharCode(64 + i)}
                </div>
              ))}
           </div>
           <div className="px-6 py-3 bg-slate-900 rounded-3xl text-white group cursor-pointer hover:bg-cyan-600 transition-all duration-500">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                 Live Comms <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 animate-pulse" />
              </span>
           </div>
        </div>
      </div>

      {/* 📊 PERFORMANCE OVERVIEW HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Participants', val: bookings.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Confirmed Bookings', val: bookings.filter(b => b.status === 'CONFIRMED').length, icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Awaiting Confirmation', val: bookings.filter(b => b.status === 'PENDING').length, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Platform Status', val: 'Online', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.05)] group hover:border-cyan-500/20 transition-all cursor-default"
          >
             <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="h-10 w-[1px] bg-slate-100 group-hover:bg-cyan-100 transition-colors"></div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
             <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
          </motion.div>
        ))}
      </div>

      {/* 📡 BOOKING MANAGEMENT PORTAL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        
        {/* OPERATIONAL HUB (Main Table) */}
        <div className="xl:col-span-2 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-6 bg-cyan-600 rounded-full"></div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Recent Booking Activity</h3>
              </div>
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 group">
                 {['ALL', 'CONFIRMED', 'PENDING'].map(f => (
                   <button 
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                   >
                     {f === 'ALL' ? 'Global' : f}
                   </button>
                 ))}
              </div>
           </div>

           {loading ? (
             <div className="py-40 flex flex-col items-center justify-center animate-pulse">
                <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Synchronizing Telemetry...</p>
             </div>
           ) : filteredBookings.length === 0 ? (
             <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[48px] py-32 flex flex-col items-center justify-center text-center px-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-8 group overflow-hidden">
                   <Compass className="w-8 h-8 text-slate-200 group-hover:text-cyan-500 group-hover:scale-125 group-hover:rotate-45 transition-all duration-700" />
                </div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">No Recent Activity Detected</h4>
                <p className="text-sm text-slate-400 max-w-sm font-medium leading-relaxed mb-10">All sectors are currently up to date. New participant bookings will appear here instantly.</p>
                <div className="flex gap-4">
                   <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl shadow-slate-900/10">Refresh List</button>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                   {filteredBookings.map((booking, idx) => (
                     <motion.div 
                       layout
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ delay: idx * 0.05 }}
                       key={booking.id}
                       className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 hover:border-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-500 relative overflow-hidden"
                     >
                       {/* DESIGN ACCENT */}
                       <div className={`absolute top-0 left-0 w-1.5 h-full ${booking.status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                       
                       <div className="flex items-center gap-8 flex-1">
                          <div className="w-24 h-24 rounded-[32px] overflow-hidden shrink-0 shadow-2xl relative group-hover:rotate-3 transition-transform duration-700">
                             <img src={booking.trek?.coverImage} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" alt="" />
                             <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                          </div>
                          
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                   {booking.status}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {booking.id.slice(-8).toUpperCase()}</span>
                             </div>
                             <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-cyan-600 transition-colors">
                                {booking.trek?.title}
                             </h4>
                             <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start Date: {new Date().toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="flex items-center gap-1.5 text-slate-900 font-black"><Users className="w-3.5 h-3.5" /> {booking.participants} Participants</span>
                             </div>
                          </div>
                       </div>

                       <div className="w-full md:w-px h-px md:h-12 bg-slate-100"></div>

                       <div className="flex flex-col gap-4 min-w-[240px]">
                          <div className="flex items-center justify-between group/user">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover/user:bg-cyan-600 transition-colors">
                                   {booking.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                   <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{booking.user?.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{booking.user?.email}</p>
                                </div>
                             </div>
                             <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-cyan-600 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                             </button>
                          </div>

                          <div className="flex gap-2">
                             <Link 
                                href={booking.expedition ? `/dashboard/treks/${booking.expedition.id}` : '#'}
                                className="flex-1 bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 group-hover:bg-cyan-600 transition-all duration-500 shadow-xl shadow-slate-900/10"
                             >
                                <span className="text-[10px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform">View Details</span>
                             </Link>
                             <button className="px-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 shadow-sm">
                                <Sliders className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
           )}
        </div>

        {/* 📋 OPERATIONAL TOOLS (Side Bar) */}
        <div className="space-y-10">
           <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden group border border-slate-800 shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                 <Clipboard className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-10">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-cyan-400/80 uppercase tracking-[0.4em]">Resource Portal</p>
                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight">Administrative <br/>Resources</h4>
                 </div>
                 
                 <div className="space-y-4">
                    {[
                      { label: 'Participant Records', icon: Users },
                      { label: 'Health Clearances', icon: Heart },
                      { label: 'Asset Overview', icon: Clipboard },
                      { label: 'Log Records', icon: Activity }
                    ].map((tool, i) => (
                      <button key={i} className="w-full p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group/item hover:bg-cyan-600 hover:border-cyan-500 transition-all duration-500">
                         <div className="flex items-center gap-4">
                            <tool.icon className="w-5 h-5 text-cyan-400 group-hover/item:text-white group-hover/item:scale-110 transition-all" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{tool.label}</span>
                         </div>
                         <ChevronRight className="w-4 h-4 text-white/20 group-hover/item:translate-x-1 transition-all" />
                      </button>
                    ))}
                 </div>

                 <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                       <span>Tactical V4.2</span>
                       <span className="text-cyan-400">Stable Build</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* 🛡️ RECENT ACTIVITY LOGS */}
           <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm space-y-10 group">
              <div className="flex items-center justify-between">
                 <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Activity Log</h4>
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
              </div>

              <div className="space-y-6">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-px bg-slate-100 relative group-hover:bg-cyan-100 transition-colors">
                         <div className="absolute top-2 -left-[3px] w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-cyan-500 transition-colors"></div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">02:14:00 UTC</p>
                         <p className="text-[9px] font-bold text-slate-900 uppercase tracking-tighter leading-tight">
                            {i === 1 ? 'Booking confirmation: Trek Everest - Participant verified.' : 
                             i === 2 ? 'Security verification complete for authorized user.' : 
                             'Secured communication channel established.'}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>

              <button className="w-full text-center text-[10px] font-black text-cyan-600 uppercase tracking-[0.4em] pt-4 hover:tracking-[0.6em] transition-all">View All Activity</button>
           </div>
        </div>
      </div>
    </div>
  );
};
