'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit3, ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import TourForm from '@/components/admin/tours/TourForm';
import { getTourById, upsertTour } from '@/lib/actions/tour-actions';

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tourData, setTourData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadTour() {
      try {
        const data = await getTourById(id);
        if (!data) {
          setError('Mission Profile Not Found');
          return;
        }
        setTourData(data);
      } catch (err: any) {
        setError(err.message || 'Retrieval Failure');
      } finally {
        setLoading(false);
      }
    }
    loadTour();
  }, [id]);

  const handleUpdate = async (data: any) => {
    setSaving(true);
    setError(null);
    try {
      await upsertTour({ ...data, id });
      router.push('/adminControl/tours');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Mission Profile Update Failure');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Hydrating Mission Intel...</p>
      </div>
    );
  }

  if (error || !tourData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-white font-black text-xl uppercase tracking-widest">{error || 'Unknown Failure'}</h2>
        <Link href="/adminControl/tours" className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all">
          Return to HQ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24">
      {/* 🧭 Local Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href="/adminControl/tours"
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-all text-xs font-black uppercase tracking-widest mb-4"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Cancel Changes
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Edit Tour Details</h1>
          </div>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em]">Updating Tour Package: {id}</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-black uppercase tracking-widest animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* 🛠️ Tour Management Form */}
      <TourForm initialData={tourData} onSubmit={handleUpdate} loading={saving} />
    </div>
  );
}
