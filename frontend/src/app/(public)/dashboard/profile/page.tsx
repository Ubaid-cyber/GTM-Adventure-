'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Globe, 
  Mail, 
  Calendar, 
  Activity, 
  Users, 
  Zap, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function UserProfile() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as any)?.role || 'TREKKER';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFF] pt-28 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP LEVEL HUD: Identity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] mb-8"
        >
          {/* Background visual elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            {/* Bio-metric Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-[6px] border-white bg-slate-50 overflow-hidden shadow-2xl ring-1 ring-slate-100">
                {user.image ? (
                  <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-5xl font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Personnel Identity */}
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{user.name}</h1>
                <span className="px-5 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  {role}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mb-8">
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                  <Mail className="w-4 h-4 text-primary/40" />
                  <span className="text-xs font-semibold truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                  <MapPin className="w-4 h-4 text-primary/40" />
                  <span className="text-xs font-semibold">Location: Not Set</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="px-8 py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                  Edit Profile
                </button>
                <button className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Download Profile
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROLE-SPECIFIC HUD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT QUADRANT: Vitals & Core Stats (TREKKER focus) */}
          {role === 'TREKKER' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 space-y-8"
            >
              {/* Medical Summary Widget */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-rose-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Health Summary</h3>
                  </div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Monitoring Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Oxygen (SpO2)</div>
                    <div className="text-3xl font-bold text-slate-900 leading-none">98<span className="text-sm font-medium text-slate-400 ml-1">%</span></div>
                    <div className="mt-3 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[98%]"></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Heart Rate</div>
                    <div className="text-3xl font-bold text-slate-900 leading-none">72<span className="text-sm font-medium text-slate-400 ml-1">bpm</span></div>
                    <div className="mt-3 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[70%]"></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Health Status</div>
                    <div className="text-xs font-bold text-emerald-500 uppercase flex items-center justify-center gap-1.5 h-full pt-1">
                      <Shield className="w-3.5 h-3.5" /> Ready for Expedition
                    </div>
                  </div>
                </div>
              </div>

              {/* Adventure History */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    My Adventure History
                  </h3>
                  <div className="text-xs font-bold text-slate-400">Total Treks: 0</div>
                </div>
                
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-[32px]">
                   <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                      <Calendar className="w-8 h-8 text-slate-300" />
                   </div>
                   <h4 className="text-lg font-bold text-slate-900 mb-2">No Recent Treks Found</h4>
                   <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">Your adventure history is currently empty. Secure your first booking to activate profile statistics.</p>
                   <button className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em] group">
                      Explore Treks <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEADER QUADRANT: Fleet & Crew Management */}
          {role === 'LEADER' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 space-y-8"
            >
              <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Team Overview</h3>
                  </div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-50 rounded-full">Trek Leader Access</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Active Team Members</div>
                     <div className="text-5xl font-black mb-4 group-hover:scale-110 transition-transform origin-left">0</div>
                     <p className="text-xs text-white/50 leading-relaxed">Assigned trekkers for your upcoming Himalayan journeys will appear here.</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-center">
                     <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Status</span>
                     </div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Connection: Optimal</h4>
                     <p className="text-xs text-slate-500 mb-6">Satellite Connection: Stable. Local Command Center Node: Active.</p>
                     <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500/20"></div>
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Leader Console - Tactical Map Placeholder */}
              <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 h-[300px] relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                 <div className="relative z-10 flex flex-col h-full justify-center items-center text-center">
                    <Globe className="w-16 h-16 text-white/10 mb-6 animate-spin-slow" />
                    <h3 className="text-white text-lg font-bold mb-2">Tactical Map Engine</h3>
                    <p className="text-white/40 text-xs tracking-widest uppercase">Awaiting Expedition Deployment Signal</p>
                 </div>
              </div>
            </motion.div>
          )}

          {/* ADMIN QUADRANT: Logic & System (Placeholder) */}
          {role === 'ADMIN' && (
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="lg:col-span-8 space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                     <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-bold text-slate-900 uppercase tracking-widest">Global Metrics</h3>
                     </div>
                     <div className="space-y-6">
                        {[
                          { label: "Active Sessions", value: "1,204", change: "+12%" },
                          { label: "Rev / Month", value: "₹4.1M", change: "+4%" },
                          { label: "Server Load", value: "12%", change: "Stable" }
                        ].map((stat, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <div className="text-xs font-bold text-slate-500">{stat.label}</div>
                             <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-slate-900">{stat.value}</span>
                                <span className="text-[10px] font-black text-emerald-500">{stat.change}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-[40px] p-8 shadow-xl text-white">
                     <div className="flex items-center gap-3 mb-8">
                        <h3 className="text-base font-bold text-white uppercase tracking-widest">Admin Panel</h3>
                     </div>
                     <div className="space-y-4">
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-xs font-black uppercase tracking-widest text-left px-6">
                           Manage Trek Inventory
                        </button>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-xs font-black uppercase tracking-widest text-left px-6">
                           Audit Security Logs
                        </button>
                        <button className="w-full py-4 bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 transition-all rounded-2xl text-xs font-black uppercase tracking-widest text-left px-6 border border-rose-500/30">
                           Critical Alert Broadcast
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* RIGHT QUADRANT: Common Data Blocks */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
            {/* Account Metadata HUD */}
            <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-8">Registry Metadata</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Calendar className="w-4 h-4" />
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Since</div>
                      <div className="text-sm font-bold text-slate-700">March 2026</div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Shield className="w-4 h-4" />
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Security Key</div>
                      <div className="text-sm font-bold text-slate-700 truncate max-w-[120px]">E2EE-Active-HUD</div>
                   </div>
                </div>
              </div>
            </div>

            {/* Personal Profile / Bio */}
            <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-[40px] p-8">
               <h3 className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-6 text-center">Personnel Dossier</h3>
               <p className="text-sm text-slate-600 font-medium italic leading-relaxed text-center">
                 "Awaiting professional bio update. Complete your dossier to optimize crew selection and leader pairing."
               </p>
               <div className="mt-8 pt-8 border-t border-slate-200/50 flex justify-center italic text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  End of Transmission
               </div>
            </div>
          </motion.div>

        </div>
      </div>
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
