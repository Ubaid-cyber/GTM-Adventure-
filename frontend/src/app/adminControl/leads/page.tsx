'use client';

import React, { useEffect, useState } from 'react';
import { getLeads, getLeadStats } from '@/lib/actions/lead-actions';
import { StatCard } from '../components/StatCard';
import { Inbox, Zap, Phone, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import LeadsTable from './components/LeadsTable';

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, NEW: 0, followUps: 0, CONVERTED: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsResult, statsResult] = await Promise.all([
        getLeads(),
        getLeadStats()
      ]);

      if (leadsResult.success) setLeads(leadsResult.leads || []);
      if (statsResult.success) setStats(statsResult.stats);
      
      if (!leadsResult.success || !statsResult.success) {
        setError(leadsResult.error || statsResult.error || 'Failed to sync inquiries');
      }
    } catch (err) {
      setError('A system error occurred during data synchronization.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Synchronizing Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* 🏔️ High-Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Leads & Inquiries</h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Manage your customer inquiries and leads.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Live Sync Active</span>
        </div>
      </div>

      {/* 📊 Strategic Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          name="Total Inquiries" 
          value={stats.total.toString()} 
          icon={Inbox} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
          growth="System"
          growthColor="text-blue-500"
        />
        <StatCard 
          name="New Inquiries" 
          value={stats.NEW.toString()} 
          icon={Zap} 
          color="text-amber-500" 
          bg="bg-amber-500/10" 
          growth="Action Required"
          growthColor="text-amber-500"
        />
        <StatCard 
          name="Active Follow-ups" 
          value={stats.followUps.toString()} 
          icon={Phone} 
          color="text-purple-500" 
          bg="bg-purple-500/10" 
          growth="In Progress"
          growthColor="text-purple-500"
        />
        <StatCard 
          name="Conversions" 
          value={stats.CONVERTED.toString()} 
          icon={CheckCircle2} 
          color="text-emerald-500" 
          bg="bg-emerald-500/10" 
          growth="Success Rate"
          growthColor="text-emerald-500"
        />
      </div>

      {/* 🛡️ Inquiry List (The Table) */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
           <h2 className="text-xl font-bold tracking-tight uppercase italic leading-none">Inquiry List</h2>
        </div>
        
        {error && (
           <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
           </div>
        )}

        <LeadsTable leads={leads} onUpdate={fetchData} />
      </div>
    </div>
  );
}
