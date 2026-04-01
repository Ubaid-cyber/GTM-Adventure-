'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Settings, Users, Globe, Database, Activity, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AdminDashboardProps {
  user: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-10">
      {/* HEADER: ADMIN HUD IDENTITY */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-[2px] bg-cyan-600"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Auth Level: SYSTEM ADMIN</p>
          </div>
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic">
             Admin <span className="text-cyan-600/80">Dashboard</span>
          </h1>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                System: Optimal
             </span>
             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span>Network: Secure</span>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center gap-4 group hover:border-cyan-500/30 transition-all">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Global Authorization</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-wider">OVERSEER</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white group-hover:bg-cyan-600 transition-all">
              {user?.name?.charAt(0) || 'A'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Personnel', val: '1,284', icon: Users, color: 'text-blue-500' },
          { label: 'Active Missions', val: '42', icon: Globe, color: 'text-cyan-500' },
          { label: 'Network Health', val: '99.9%', icon: Activity, color: 'text-emerald-500' },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group hover:border-cyan-500/20"
          >
             <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-cyan-50 transition-colors`}>
                   <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="w-1 h-8 bg-slate-100 rounded-full"></div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
             <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{stat.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* MEDICAL REVIEW GATEWAY */}
        <Link href="/dashboard/admin/medical" className="group">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden h-full"
           >
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Database className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-8">
                 <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Medical Records <br/>System</h3>
                    <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">Verify trekker health credentials and authorize mission participation.</p>
                 </div>
                 <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 group-hover:translate-x-2 transition-transform">
                    Enter Medical Hub <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
           </motion.div>
        </Link>

        {/* SYSTEM CONFIGURATION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden group"
        >
          <div className="relative z-10 space-y-8">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Settings className="w-6 h-6 text-slate-900" />
             </div>
             <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Platform <br/>Core Control</h3>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">Adjust global deployment parameters and mission security protocols.</p>
             </div>
             <div className="flex gap-4">
                <div className="flex-1 h-[2px] bg-slate-100 rounded-full relative overflow-hidden">
                   <div className="absolute inset-y-0 left-0 bg-cyan-600 w-3/4 animate-pulse"></div>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">V 4.0.2</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
