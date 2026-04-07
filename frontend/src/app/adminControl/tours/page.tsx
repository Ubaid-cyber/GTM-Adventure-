import React from 'react';
import Link from 'next/link';
import { Plus, MapPin, Search, Filter, Mountain } from 'lucide-react';
import { getAdminTours } from '@/lib/actions/tour-actions';
import TourTable from '@/components/admin/tours/TourTable';
import { deleteTour } from '@/lib/actions/tour-actions';

export default async function AdminToursPage() {
  const tours = await getAdminTours();

  const handleDelete = async (id: string) => {
    'use server';
    await deleteTour(id);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 🏔️ Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Tour Packages</h1>
          </div>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em]">Manage Your Travel Catalog</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tours..."
              className="bg-white/5 border border-white/5 rounded-full pl-12 pr-6 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-64 transition-all"
            />
          </div>
          <button className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full border border-white/5 transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <Link 
            href="/adminControl/tours/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Tour
          </Link>
        </div>
      </div>

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Tours', val: tours.length, icon: MapPin, color: 'text-blue-500' },
          { label: 'Advanced Tours', val: tours.filter(t => t.difficulty === 'Extreme').length, icon: Mountain, color: 'text-rose-500' },
          { label: 'Total Capacity', val: tours.reduce((acc, t) => acc + t.maxCapacity, 0), icon: Search, color: 'text-green-500' },
          { label: 'Active Drafts', val: 0, icon: Filter, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} border border-white/5 shadow-inner`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                <p className="text-xl font-black text-white">{stat.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🎯 Master Inventory Table */}
      <TourTable tours={tours as any} onDelete={handleDelete} />
    </div>
  );
}
