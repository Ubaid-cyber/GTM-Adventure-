'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Mail, Phone, Calendar, Search, Filter, ChevronRight, MessageSquare, MoreVertical, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { LeadStatus } from '@/types/leads';
import LeadDetailsModal from './LeadDetailsModal';

interface LeadsTableProps {
  leads: any[];
  onUpdate: () => void;
}

const STATUS_STYLING: Record<LeadStatus, string> = {
  NEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  CONTACTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  QUALIFIED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  LOST: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export default function LeadsTable({ leads, onUpdate }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'ALL'>('ALL');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const filteredLeads = React.useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.trek?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'ALL' || lead.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Search & Filtering Control Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search inquiries by name, email, or trek..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold placeholder:text-white/10 outline-none focus:border-blue-500/30 focus:bg-white/[0.04] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {(['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as any)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedStatus === status 
                ? 'bg-blue-600 text-white border-blue-500/30 shadow-lg shadow-blue-600/20' 
                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid/List */}
      <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Customer Info</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Trek Details</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Inquiry Date</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="group hover:bg-white/[0.02] transition-all cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-transparent flex items-center justify-center border border-blue-600/10 group-hover:scale-110 transition-transform">
                          <Inbox className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{lead.name}</p>
                          <div className="flex items-center gap-2 mt-1 opacity-50">
                             <Mail className="w-3 h-3" />
                             <span className="text-[10px] font-medium tracking-tight leading-none">{lead.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/80">{lead.trek?.title || 'General Journey'}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">
                             Package Query
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-white/60">{format(new Date(lead.createdAt), 'MMM dd')}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">
                             {format(new Date(lead.createdAt), 'yyyy')}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${STATUS_STYLING[lead.status as LeadStatus]}`}>
                          {lead.status}
                       </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group/btn">
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-1" />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <div className="space-y-4">
                        <Inbox className="w-12 h-12 text-white/5 mx-auto" />
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No inquiries found</p>
                           <p className="text-xs font-medium text-white/10 leading-relaxed">Adjust your filters to see more results.</p>
                        </div>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render the details modal when a lead is selected */}
      {selectedLead && (
         <LeadDetailsModal 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)} 
            onUpdate={onUpdate}
         />
      )}
    </div>
  );
}
