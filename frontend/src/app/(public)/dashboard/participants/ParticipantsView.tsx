'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronLeft,
  Filter,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Participant {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  trek: {
    title: string;
    coverImage?: string;
  };
  status: string;
  participants: number;
}

interface ParticipantsViewProps {
  participants: Participant[];
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({ participants }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [trekFilter, setTrekFilter] = useState('ALL');

  const trekTitles = Array.from(new Set(participants.map(p => p.trek.title)));

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = 
      p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.trek.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = trekFilter === 'ALL' || p.trek.title === trekFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* 🧭 NAVIGATION & HEADER HUD */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-cyan-500 transition-all uppercase tracking-[0.3em] group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
            Back
          </button>
          
          <div className="flex items-center gap-2">
             <div className="w-8 h-[1.5px] bg-cyan-500"></div>
             <p className="text-[9px] font-black text-cyan-600/80 uppercase tracking-[0.5em]">Trek Members</p>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
             My <span className="text-cyan-600/90">Participants</span>
          </h1>
          
          <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                Status: Updated
             </span>
             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span>Leader View</span>
          </div>
        </div>

        {/* 🔍 SEARCH & FILTERS CABINET */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
           <div className="relative group w-full sm:w-64">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-cyan-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full pl-12 pr-6 py-2.5 text-xs font-bold outline-none focus:border-cyan-500/30 focus:shadow-xl transition-all"
              />
           </div>

           <select 
              value={trekFilter}
              onChange={(e) => setTrekFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-full px-6 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none focus:border-cyan-500/30 transition-all cursor-pointer appearance-none min-w-[150px]"
           >
              <option value="ALL">All Treks</option>
              {trekTitles.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
           </select>
        </div>
      </div>

      {/* 📊 PARTICIPANT GRID */}
      {filteredParticipants.length === 0 ? (
        <div className="py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center px-10">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group overflow-hidden">
              <Users className="w-5 h-5 text-slate-200 group-hover:text-cyan-500 transition-all duration-700" />
           </div>
           <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">No people found</h4>
           <p className="text-xs text-slate-400 max-w-sm font-medium leading-relaxed">Try looking for another name.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <AnimatePresence mode="popLayout">
              {filteredParticipants.map((p, idx) => (
                <motion.div 
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm group hover:border-cyan-500/30 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-600/10 group-hover:bg-cyan-600 transition-colors"></div>
                  
                  <div className="flex items-center gap-4 mb-5">
                     <div className="w-11 h-11 rounded-[16px] overflow-hidden border border-slate-100 shadow group-hover:rotate-3 transition-transform">
                        <img 
                          src={p.user.profileImage || `https://ui-avatars.com/api/?name=${p.user.name}&background=0f172a&color=fff`} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                     </div>
                     <div className="space-y-0 overflow-hidden">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-cyan-600 transition-colors truncate">{p.user.name}</h3>
                        <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase truncate">{p.user.email}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                              <Zap className="w-2.5 h-2.5 text-cyan-600" />
                           </div>
                           <div className="overflow-hidden max-w-[100px]">
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Assigned Trek</p>
                              <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight truncate">{p.trek.title}</p>
                           </div>
                        </div>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                              <Phone className="w-2 h-2" /> Phone
                           </p>
                           <p className="text-[8px] font-bold text-slate-900 truncate">{p.user.phone || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors text-right">
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center justify-end gap-1">
                              Group <Users className="w-2 h-2" />
                           </p>
                           <p className="text-xs font-black text-slate-900">{p.participants}</p>
                        </div>
                     </div>

                     <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-cyan-600 transition-all group/btn outline-none">
                        View Details <ExternalLink className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                     </button>
                  </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
};
