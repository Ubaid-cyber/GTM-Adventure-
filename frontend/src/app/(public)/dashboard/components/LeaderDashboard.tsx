'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Compass, ChevronRight, Activity, Calendar, 
  MapPin, Zap, AlertCircle, Users, Globe, ExternalLink,
  Clipboard, Heart, Sliders, Search, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeaderMedicalView } from './LeaderMedicalView';
import { formatDateOnly } from '@/lib/utils/date-safe';
import { getLeaderBookingsAction } from '@/lib/actions/leader-actions';

interface LeaderDashboardProps {
  user: any;
  apiToken: string;
}

export const LeaderDashboard: React.FC<LeaderDashboardProps> = ({ user, apiToken }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [activeView, setActiveView] = useState<'MAIN' | 'MEDICAL' | 'RESOURCES'>('MAIN');
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchOperationalData = async () => {
      try {
        const data = await getLeaderBookingsAction();
        setBookings(data);
      } catch (err) {
        console.error('Data Sync Failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperationalData();
  }, [user.email, apiToken]);

  const filteredBookings = bookings.filter(b => 
    filter === 'ALL' || b.status === filter
  );

  if (activeView === 'MEDICAL') {
     return <LeaderMedicalView user={user} apiToken={apiToken} onBack={() => setActiveView('MAIN')} />;
  }

  return (
    <div className="space-y-12">
      {/* 🚀 DASHBOARD HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-[2px] bg-cyan-500"></div>
             <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-[0.5em]">Role: Trek Leader</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
             Leader <span className="text-cyan-600/90">Dashboard</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                Status: Active
             </span>
             <span className="w-1 h-1 bg-white/10 rounded-full"></span>
             <span>Connection: Secure</span>
             <span className="w-1 h-1 bg-white/10 rounded-full"></span>
             <span className="flex items-center gap-2 text-white/50"><Globe className="w-3 h-3 text-cyan-500" /> Map View</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-[32px]">
           <div className="flex -space-x-3 ml-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white/40">
                   {String.fromCharCode(64 + i)}
                </div>
              ))}
           </div>
           <div className="px-6 py-3 bg-slate-900 rounded-3xl text-white group cursor-pointer hover:bg-cyan-600 transition-all duration-500 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                 Messages <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 animate-pulse" />
              </span>
           </div>
        </div>
      </div>

      {/* 📊 OVERVIEW STATS - GLASS THEME FOR EYE COMFORT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Members', val: bookings.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Confirmed', val: bookings.filter(b => b.status === 'CONFIRMED').length, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending', val: bookings.filter(b => b.status === 'PENDING').length, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'System status', val: 'Online', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10 group hover:border-cyan-500/40 transition-all cursor-default"
          >
             <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="h-10 w-[1px] bg-white/10 group-hover:bg-cyan-500/20 transition-colors"></div>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
             <p className="text-3xl font-black text-white tracking-tighter">{stat.val}</p>
          </motion.div>
        ))}
      </div>

      {/* 📡 BOOKINGS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        
        {/* MAIN LIST */}
        <div className="xl:col-span-2 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-6 bg-cyan-600 rounded-full"></div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">Current Members</h3>
              </div>
              <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 gap-1 group">
                 {['ALL', 'CONFIRMED', 'PENDING'].map(f => (
                   <button 
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                   >
                     {f === 'ALL' ? 'All' : f}
                   </button>
                 ))}
              </div>
           </div>

           {loading ? (
             <div className="py-40 flex flex-col items-center justify-center animate-pulse">
                <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Loading...</p>
             </div>
           ) : filteredBookings.length === 0 ? (
             <div className="bg-white/5 backdrop-blur-sm border border-dashed border-white/10 rounded-[48px] py-32 flex flex-col items-center justify-center text-center px-10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center shadow-xl mb-8 group overflow-hidden border border-white/5">
                   <Compass className="w-8 h-8 text-white/10 group-hover:text-cyan-500 group-hover:scale-125 transition-all duration-700" />
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4">No active members</h4>
                <p className="text-sm text-slate-500 max-w-sm font-medium leading-relaxed mb-10">No bookings found for your current treks.</p>
                <button 
                   onClick={() => window.location.reload()}
                   className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl shadow-slate-900/40 border border-white/5"
                >
                   Refresh List
                </button>
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
                       className="group bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-sm flex flex-col md:flex-row items-center gap-10 hover:border-cyan-500/40 transition-all duration-500 relative overflow-hidden"
                     >
                       <div className={`absolute top-0 left-0 w-1.5 h-full ${booking.status === 'CONFIRMED' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`}></div>
                       
                       <div className="flex items-center gap-8 flex-1">
                          <div className="w-24 h-24 rounded-[32px] overflow-hidden shrink-0 shadow-2xl relative group-hover:rotate-3 transition-transform duration-700 border border-white/10">
                             <img src={booking.trek?.coverImage} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-125 transition-all duration-1000" alt="" />
                             <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-transparent transition-colors"></div>
                          </div>
                          
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                                   {booking.status}
                                </span>
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">ID: {booking.id.slice(-8).toUpperCase()}</span>
                             </div>
                             <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-cyan-500 transition-colors">
                                {booking.trek?.title}
                             </h4>
                             <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {mounted ? formatDateOnly(new Date()) : '-- --- ----'}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                <span className="flex items-center gap-1.5 text-white/80"><Users className="w-3.5 h-3.5" /> {booking.participants} Members</span>
                             </div>
                          </div>
                       </div>

                       <div className="w-full md:w-px h-px md:h-12 bg-white/10"></div>

                       <div className="flex flex-col gap-4 min-w-[240px]">
                          <div className="flex items-center justify-between group/user">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover/user:bg-cyan-500 transition-colors">
                                   {booking.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                   <p className="text-[11px] font-black text-white uppercase tracking-tighter">{booking.user?.name}</p>
                                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">{booking.user?.email}</p>
                                </div>
                             </div>
                          </div>

                          <div className="flex gap-2">
                             <Link 
                                href={booking.expedition ? `/dashboard/treks/${booking.expedition.id}` : '#'}
                                className="flex-1 bg-white text-slate-900 rounded-2xl py-4 flex items-center justify-center gap-3 hover:bg-cyan-500 hover:text-white transition-all duration-500 shadow-xl"
                             >
                                <span className="text-[10px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform">Details</span>
                             </Link>
                             <button className="px-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white shadow-sm">
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

        {/* 📋 LEADER TOOLS */}
        <div className="space-y-10">
           <div className="bg-white/5 backdrop-blur-xl rounded-[48px] p-10 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 text-cyan-500">
                 <Shield className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-10">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Administration</p>
                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight">Management<br/>Tools</h4>
                 </div>
                 
                 <div className="space-y-4">
                    {[
                      { id: 'PARTICIPANTS', label: 'Members', icon: Users },
                      { id: 'MEDICAL', label: 'Medical Records', icon: Heart },
                      { id: 'ASSETS', label: 'Gear List', icon: Clipboard },
                      { id: 'LOGS', label: 'Activity Logs', icon: Activity }
                    ].map((tool, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          if (tool.id === 'PARTICIPANTS') router.push('/dashboard/participants');
                          else if (tool.id === 'MEDICAL') setActiveView('MEDICAL');
                          else null;
                        }}
                        className="w-full p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group/item hover:bg-cyan-600 hover:border-cyan-500 transition-all duration-500"
                      >
                         <div className="flex items-center gap-4">
                            <tool.icon className="w-5 h-5 text-cyan-500 group-hover/item:text-white group-hover/item:scale-110 transition-all" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{tool.label}</span>
                         </div>
                         <ChevronRight className="w-4 h-4 text-white/20 group-hover/item:translate-x-1 transition-all" />
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* 🛡️ RECENT ACTIVITY */}
           <div className="bg-white/5 backdrop-blur-xl rounded-[48px] p-10 border border-white/10 shadow-sm space-y-10 group">
              <div className="flex items-center justify-between">
                 <h4 className="text-base font-black text-white/40 uppercase tracking-widest">Feed</h4>
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
              </div>

              <div className="space-y-6">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex gap-6 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="w-px bg-white/5 relative group-hover:bg-cyan-500/20 transition-colors">
                         <div className="absolute top-2 -left-[3px] w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-cyan-500 transition-colors"></div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Live</p>
                         <p className="text-[9px] font-bold text-white uppercase tracking-tighter leading-tight">
                            {i === 1 ? 'Booking confirmed for expedition.' : 
                             i === 2 ? 'Safety protocol verified.' : 
                             'Communication active.'}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
