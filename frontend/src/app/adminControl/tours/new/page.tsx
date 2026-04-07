'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import TourForm from '@/components/admin/tours/TourForm';
import { upsertTour } from '@/lib/actions/tour-actions';

export default function NewTourPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await upsertTour(data);
      router.push('/adminControl/tours');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Tour Creation Failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* 🧭 Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href="/adminControl/tours"
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-all text-xs font-black uppercase tracking-widest mb-4"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tours
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Add New Tour</h1>
          </div>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em]">Create a New Travel Package</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-black uppercase tracking-widest animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* 🛠️ Tour Management Form */}
      <TourForm onSubmit={handleCreate} loading={loading} />
    </div>
  );
}
