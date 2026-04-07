'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  Mountain, 
  Users, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils/formatters';

interface Tour {
  id: string;
  title: string;
  location: string;
  durationDays: number;
  difficulty: string;
  price: number;
  maxAltitude: number | null;
  coverImage: string | null;
  _count: {
    bookings: number;
    expeditions: number;
  };
}

interface TourTableProps {
  tours: Tour[];
  onDelete: (id: string) => Promise<void>;
}

export default function TourTable({ tours, onDelete }: TourTableProps) {
  const handleDeleteClick = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await onDelete(id);
      toast.success('Tour deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tour');
    }
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Tour Name</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Stats</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Details</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Bookings</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tours.map((tour, index) => (
              <motion.tr 
                key={tour.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-white/[0.03] transition-colors"
              >
                {/* Profile */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                      {tour.coverImage ? (
                        <img src={tour.coverImage} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{tour.title}</h4>
                      <p className="text-[11px] text-white/40 flex items-center gap-1.5 mt-0.5 font-medium">
                        <MapPin className="w-3 h-3" />
                        {tour.location}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Stats */}
                <td className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-3.5 h-3.5 text-blue-500/70" />
                      <span className="text-xs font-bold">{tour.durationDays} Days</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <div className="w-3.5 h-3.5 text-green-500/70 font-bold flex items-center justify-center text-xs">₹</div>
                      <span className="text-sm font-black text-white">{formatINR(tour.price)}</span>
                    </div>
                  </div>
                </td>

                {/* Details */}
                <td className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-white/60">
                      <Mountain className="w-3.5 h-3.5 text-rose-500/70" />
                      <span className="text-xs font-bold">{tour.maxAltitude || '0'} M</span>
                    </div>
                    <div className={`
                      inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest
                      ${tour.difficulty === 'Extreme' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 
                        tour.difficulty === 'Moderate' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 
                        'bg-blue-500/20 text-blue-500 border border-blue-500/30'}
                    `}>
                      {tour.difficulty}
                    </div>
                  </div>
                </td>

                {/* Bookings */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{tour._count.bookings}</span>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Paid</span>
                    </div>
                    <div className="h-6 w-px bg-white/5"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{tour._count.expeditions}</span>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Active</span>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/adminControl/tours/${tour.id}/edit`}
                      className="p-2 rounded-lg bg-white/5 hover:bg-blue-600/20 text-white/40 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(tour.id, tour.title)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-600/20 text-white/40 hover:text-rose-500 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tours.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
            <MapPin className="w-8 h-8 text-white/10" />
          </div>
          <h3 className="text-white font-bold uppercase tracking-widest text-sm">No Tours Found</h3>
          <p className="text-white/30 text-xs mt-2 max-w-xs mx-auto">Your list of tour packages is empty. Start by adding your first tour.</p>
          <Link href="/adminControl/tours/new" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-blue-500 transition-all">
            Add New Tour
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
