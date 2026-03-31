'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Globe, 
  Activity, 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  Users,
  Compass,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdventureDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as any)?.role || 'TREKKER';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6 lg:px-12 relative overflow-hidden">
      {/* HUD Background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2 italic">
              Expedition <span className="text-primary">Basecamp</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex h-2 w-2 relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: Active • Secure Session (30D)</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="px-4 py-2 border-r border-slate-100 text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Member Level</div>
              <div className="text-xs font-bold text-slate-900 uppercase">{role}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
               {user.name?.charAt(0)}
            </div>
          </motion.div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CORE TELEMETRY */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ROLE-BASED WIDGETS */}
            {role === 'TREKKER' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Expedition Status */}
                <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                   <Compass className="w-8 h-8 text-primary mb-8" />
                   <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Basecamp Operations</h3>
                   <div className="text-2xl font-bold mb-2 uppercase tracking-tighter">No Scheduled Deployments</div>
                   <p className="text-sm text-white/50 mb-8 max-w-xs">Your biological status is on standby. Secure an expedition to launch telemetry.</p>
                   <Link href="/treks" className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
                      Explore Treks <ChevronRight className="w-4 h-4" />
                   </Link>
                </div>

                {/* Bio-metric Sync */}
                <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
                   <Activity className="w-8 h-8 text-rose-500 mb-8" />
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Health Status</h3>
                   <div className="flex items-end gap-2 mb-6">
                      <span className="text-4xl font-black text-slate-900 leading-none">98</span>
                      <span className="text-xs font-bold text-slate-400 uppercase mb-1">Optimal</span>
                   </div>
                   <div className="space-y-4">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[98%]"></div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Last Scan: 2 mins ago</p>
                   </div>
                </div>
              </motion.div>
            )}

            {(role === 'ADMIN' || role === 'LEADER') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-12">
                   <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                       <h3 className="text-base font-black text-slate-900 uppercase tracking-widest italic">Global Fleet Readiness</h3>
                   </div>
                   <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Live Updates</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                   {[
                     { label: "Active Expeditions", val: "14", change: "+2", icon: Globe },
                     { label: "Total Personnel", val: "1,204", change: "+12", icon: Users },
                     { label: "Alert Contexts", val: "0", change: "STABLE", icon: Zap },
                   ].map((stat, i) => (
                     <div key={i} className="flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                           <div className="flex items-center gap-3">
                              <span className="text-2xl font-black text-slate-900">{stat.val}</span>
                              <span className="text-[10px] font-bold text-emerald-500">{stat.change}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {/* COMMON: RECENT ACTIVITY / BOOKINGS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm"
            >
               <h3 className="text-base font-black text-slate-900 uppercase tracking-widest mb-8">Expedition Registry</h3>
               <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                     <AlertCircle className="w-8 h-8 text-slate-200" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">No Recent Signals Received</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">This quadrant displays upcoming departures and logistical updates for your assigned expeditions.</p>
               </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: SECURITY & TOOLS */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* SECURITY PERIMETER STATUS */}
            <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-[40px] p-10">
               <Shield className="w-8 h-8 text-primary mb-8" />
               <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] mb-4">Security Perimeter</h3>
               <div className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  ZERO TRUST ACTIVE
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Last Verified</span>
                     <span className="text-slate-900">Today, 09:42</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Sudo Elevation</span>
                     <span className="text-rose-500">Standby</span>
                  </div>
               </div>
               
               <Link href="/dashboard/profile" className="mt-10 w-full flex items-center justify-center py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 transition-all">
                  Access Secure Dossier
               </Link>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">Elite Operations</h3>
               <div className="grid grid-cols-2 gap-4">
                  <Link href="/treks" className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center hover:bg-slate-900 hover:text-white transition-all duration-500">
                     <Compass className="w-5 h-5 mb-3 text-slate-400 group-hover:text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Book Trek</span>
                  </Link>
                  <Link href="/dashboard/bookings" className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center hover:bg-slate-900 hover:text-white transition-all duration-500">
                     <Globe className="w-5 h-5 mb-3 text-slate-400 group-hover:text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Expeditions</span>
                  </Link>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
