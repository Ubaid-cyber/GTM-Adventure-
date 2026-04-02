import React from 'react';
import { getAdminTreks } from '@/lib/actions/admin-actions';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin, 
  Calendar, 
  Users,
  Mountain,
  BarChart
} from 'lucide-react';

export default async function ManageTreksPage() {
  const treks = await getAdminTreks();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 🏔️ Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manage Treks</h1>
          <p className="text-white/40 text-sm mt-1">Global inventory of expeditions and pricing control.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95">
          <Plus className="w-4 h-4" />
          Create New Trek
        </button>
      </div>

      {/* 📊 Strategic Filters */}
      <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Search by title, location, or guide..." 
            className="w-full bg-white/[0.02] border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 focus:ring-0 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 rounded-lg text-sm font-semibold transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* 📋 Trek Inventory Table */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white/30">Trek Details</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white/30">Pricing</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white/30">Operational Data</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {treks.map((trek) => (
              <tr key={trek.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-600/10 border border-blue-600/20 flex-shrink-0 flex items-center justify-center">
                      <Mountain className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{trek.title}</div>
                      <div className="flex items-center gap-2 text-white/30 text-[11px] mt-1">
                        <MapPin className="w-3 h-3" strokeWidth={3} />
                        {trek.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">${trek.price.toLocaleString()}</span>
                    <span className="text-white/30 text-[10px] uppercase font-black">Base USD Rate</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-blue-500/50" />
                      {trek.durationDays} Days Duration
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Users className="w-3.5 h-3.5 text-blue-500/50" />
                      {trek.availableSpots} / {trek.maxCapacity} Seats Available
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-md text-xs font-bold transition-all border border-white/5">
                      Edit
                    </button>
                    <button className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {treks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-sm font-medium italic">
                  No treks found in inventory. Start by creating a new mission.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📊 Strategic Summary */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Mountain className="w-16 h-16 text-blue-500" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total Inventory</div>
          <div className="text-2xl font-bold text-white">{treks.length} <span className="text-white/20 text-sm font-medium uppercase tracking-widest ml-1">Active Treks</span></div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Users className="w-16 h-16 text-blue-500" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Guide Coverage</div>
          <div className="text-2xl font-bold text-white">94% <span className="text-white/20 text-sm font-medium uppercase tracking-widest ml-1">Staffed</span></div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <BarChart className="w-16 h-16 text-blue-500" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Average Profit Yield</div>
          <div className="text-2xl font-bold text-green-500">+12.4% <span className="text-white/20 text-sm font-medium uppercase tracking-widest ml-1">Q4 Forecast</span></div>
        </div>
      </div>
    </div>
  );
}
