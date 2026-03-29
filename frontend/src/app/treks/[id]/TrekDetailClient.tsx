'use client';

import React, { useEffect, useState } from 'react';
import BookingWidget from '@/components/BookingWidget';

interface TrekDetailClientProps {
  id: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MODERATE: 'bg-blue-100 text-blue-700',
  HARD: 'bg-orange-100 text-orange-700',
  EXTREME: 'bg-red-100 text-red-700',
};

export default function TrekDetailClient({ id }: TrekDetailClientProps) {
  const [trek, setTrek] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrek() {
      try {
        const res = await fetch(`/api/treks/${id}`);
        const data = await res.json();
        if (data.success) {
          setTrek(data.trek);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrek();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="min-h-screen pt-16 bg-background flex items-center justify-center">
        <h2 className="text-2xl font-bold text-muted">Trek not found.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Hero Image */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={trek.coverImage || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=85&w=2070'}
          alt={trek.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide shadow-sm ${DIFFICULTY_COLORS[trek.difficulty] || 'bg-gray-100 text-gray-700'}`}>
              {trek.difficulty}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {trek.durationDays} Days
            </span>
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">{trek.title}</h1>
          <p className="text-white/80 mt-3 text-lg font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {trek.location}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line text-lg bg-surface/30 p-6 rounded-2xl border border-border">{trek.description}</p>
            </section>

            {/* Highlights */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trek.highlights.map((highlight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-foreground font-medium pt-1 text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Specific details */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Expedition Details</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface/50 p-5 rounded-xl border border-border text-center">
                  <div className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Max Altitude</div>
                  <div className="text-xl font-bold text-foreground">{trek.maxAltitude}m</div>
                </div>
                <div className="bg-surface/50 p-5 rounded-xl border border-border text-center">
                  <div className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Best Season</div>
                  <div className="text-xl font-bold text-foreground">{trek.bestSeason || 'Spring/Autumn'}</div>
                </div>
                <div className="bg-surface/50 p-5 rounded-xl border border-border text-center">
                  <div className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Available Spots</div>
                  <div className="text-xl font-bold text-foreground">{trek.availableSpots}/{trek.maxCapacity}</div>
                </div>
                <div className="bg-surface/50 p-5 rounded-xl border border-border text-center">
                  <div className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Duration</div>
                  <div className="text-xl font-bold text-foreground">{trek.durationDays} Days</div>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Sidebar Right */}
          <div className="lg:w-[420px] shrink-0">
            <BookingWidget trekId={trek.id} price={trek.price} availableSpots={trek.availableSpots} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
