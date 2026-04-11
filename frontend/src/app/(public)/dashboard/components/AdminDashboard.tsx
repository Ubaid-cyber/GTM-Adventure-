'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Settings, Users, Globe, Database, 
  Activity, ChevronRight, LayoutDashboard,
  Target, Zap
} from 'lucide-react';
import Link from 'next/link';
import ExpeditionStatusView from './ExpeditionStatusView';

interface AdminDashboardProps {
  user: any;
  apiToken: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, apiToken }) => {
  const [currentView, setCurrentView] = useState<'main' | 'oversight'>('main');

  return (
    <div className="space-y-10 min-h-screen">
      {/* HEADER: ADMIN HUD IDENTITY */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-[2px] bg-cyan-600"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Auth Level: ADMIN</p>
          </div>
          <div className="flex items-center gap-4">
            {currentView !== 'main' && (
              <button 
                onClick={() => setCurrentView('main')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                title="Return to Main Dashboard"
              >
                <LayoutDashboard className="w-6 h-6 text-slate-400" />
              </button>
            )}
            <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">
               Admin <span className="text-cyan-600/80">{currentView === 'main' ? 'Dashboard' : 'Monitor'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                System: Online
             </span>
             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span>Network: Secure</span>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center gap-4 group hover:border-cyan-500/30 transition-all">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authorization Level</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-wider">ADMINISTRATOR</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white group-hover:bg-cyan-600 transition-all">
              {user?.name?.charAt(0) || 'A'}
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentView === 'main' ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Trekkers', val: '1,284', icon: Users, color: 'text-blue-500' },
                { label: 'Active Treks', val: '42', icon: Target, color: 'text-cyan-500' },
                { label: 'System Status', val: '99.9%', icon: Zap, color: 'text-amber-500' },
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group hover:border-cyan-500/20 transition-all"
                >
                   <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-cyan-50 transition-colors`}>
                         <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="w-1 h-8 bg-slate-100 rounded-full"></div>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                   <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                </div>
              ))}
            </div>

            {/* ACTION TILES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* TRIP MANAGER */}
              <button 
                onClick={() => setCurrentView('oversight')}
                className="lg:col-span-1 group"
              >
                 <div className="bg-cyan-600 rounded-[40px] p-8 text-white relative overflow-hidden h-full text-left transition-transform active:scale-[0.98]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                       <Target className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                          <Globe className="w-6 h-6 text-white" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Trip <br/>Manager</h3>
                          <p className="text-[11px] text-cyan-100 mt-3 font-medium leading-relaxed">Track live trip status and safety updates.</p>
                       </div>
                       <div className="inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                          Open Dashboard <ChevronRight className="w-3 h-3 text-white" />
                       </div>
                    </div>
                 </div>
              </button>

              {/* MEDICAL RECORDS */}
              <Link href="/dashboard/admin/medical" className="group lg:col-span-1">
                 <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden h-full transition-transform active:scale-[0.98]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                       <Activity className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Medical <br/>Records</h3>
                          <p className="text-[11px] text-slate-400 mt-3 font-medium leading-relaxed">View trip health checks and medical cleared status.</p>
                       </div>
                       <div className="inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-cyan-400 group-hover:translate-x-1 transition-transform">
                          View Records <ChevronRight className="w-3 h-3" />
                       </div>
                    </div>
                 </div>
              </Link>

              {/* SYSTEM SETTINGS */}
              <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm relative overflow-hidden group lg:col-span-1">
                <div className="relative z-10 space-y-6">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <Settings className="w-6 h-6 text-slate-900" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">System <br/>Settings</h3>
                      <p className="text-[11px] text-slate-400 mt-3 font-medium leading-relaxed">Manage site settings and technical security.</p>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <div className="flex-1 h-[2px] bg-slate-100 rounded-full relative overflow-hidden">
                         <div className="absolute inset-y-0 left-0 bg-cyan-600 w-3/4 animate-pulse"></div>
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">VER_4.2</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="oversight"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {currentView === 'oversight' && <ExpeditionStatusView apiToken={apiToken} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
