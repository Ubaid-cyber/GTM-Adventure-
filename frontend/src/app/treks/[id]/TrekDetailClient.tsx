'use client';

import React, { useEffect, useState } from 'react';
import BookingWidget from '@/components/BookingWidget';
import { motion, AnimatePresence } from 'framer-motion';
import ItineraryTimeline from '@/components/treks/ItineraryTimeline';

interface TrekDetailClientProps {
  id: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  MODERATE: 'bg-blue-100 text-blue-700 border-blue-200',
  HARD: 'bg-orange-100 text-orange-700 border-orange-200',
  EXTREME: 'bg-red-100 text-red-700 border-red-200',
};

export default function TrekDetailClient({ id }: TrekDetailClientProps) {
  const [trek, setTrek] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'gear'>('overview');

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
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="min-h-screen pt-16 bg-background flex items-center justify-center">
        <h2 className="text-2xl font-black text-muted uppercase tracking-[0.2em]">Trek Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 selection:bg-primary selection:text-white">
      {/* Hero Header */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={trek.coverImage || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=85&w=2070'}
          alt={trek.title}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
            <span className={`px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-black uppercase rounded-lg tracking-widest shadow-sm border ${DIFFICULTY_COLORS[trek.difficulty] || 'bg-gray-100 text-gray-700'}`}>
              {trek.difficulty} Grade
            </span>
            <span className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {trek.durationDays} Days
            </span>
            <span className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {trek.location}
            </span>
          </div>
          <h1 className="text-white text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-none drop-shadow-2xl">{trek.title}</h1>
          <p className="text-white/60 mt-4 text-base md:text-xl font-medium max-w-2xl leading-relaxed tracking-wide">
             Experience the standard of mountain trekking and adventure with GTM Adventure.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Hub */}
          <div className="flex-1 space-y-12">
            
            {/* Exploration Tabs */}
            <div className="bg-surface/80 backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-32 h-32 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l9 21H3L12 2z"/></svg>
               </div>

               <div className="flex border-b border-border/50 mb-6 md:mb-10 gap-4 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth">
                  {[
                    { id: 'overview', label: 'Trek Overview' },
                    { id: 'itinerary', label: 'Detailed Itinerary' },
                    { id: 'gear', label: 'Gear & Inclusions' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-foreground'}`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(30,58,138,0.8)]"
                        />
                      )}
                    </button>
                  ))}
               </div>

               <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-10"
                    >
                      {/* Description */}
                       <div className="space-y-6">
                        <h3 className="text-base md:text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                           The Expedition
                        </h3>
                        <p className="text-muted leading-relaxed whitespace-pre-line text-base md:text-lg font-medium bg-surface/50 p-6 md:p-8 rounded-2xl border border-border/50 shadow-inner">
                          {trek.description}
                        </p>
                      </div>

                      {/* Highlights Grid */}
                      <div className="space-y-6">
                         <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                           Trek Highlights
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {trek.highlights.map((highlight: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-4 bg-background/50 p-6 rounded-2xl border border-border hover:border-primary/20 hover:bg-surface transition-all shadow-sm group">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5 transition-transform group-hover:scale-110">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                              </div>
                              <span className="text-foreground font-black uppercase tracking-wide pt-2 text-xs leading-5">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'itinerary' && (
                    <motion.div
                      key="itinerary"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                       <div className="space-y-10">
                         <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                             Daily Itinerary
                         </h3>
                         <ItineraryTimeline itinerary={trek.itinerary || []} />
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'gear' && (
                    <motion.div
                      key="gear"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-12"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         {/* Inclusions */}
                         <div className="space-y-6">
                             <h4 className="text-sm font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 py-2 px-4 rounded-lg inline-block">What's Included</h4>
                            <ul className="space-y-3">
                               {(trek.inclusions || []).map((inc: string, i: number) => (
                                 <li key={i} className="flex items-center gap-3 text-sm font-bold text-muted-foreground border-l-2 border-emerald-500/20 pl-4 py-1">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                    {inc}
                                 </li>
                               ))}
                            </ul>
                         </div>

                         {/* Gear Requirements */}
                         <div className="space-y-6">
                             <h4 className="text-sm font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 py-2 px-4 rounded-lg inline-block">Required Gear</h4>
                            <ul className="space-y-3">
                               {(trek.gearRequirements || []).map((gear: string, i: number) => (
                                 <li key={i} className="flex items-center gap-3 text-sm font-bold text-muted-foreground border-l-2 border-blue-500/20 pl-4 py-1">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    {gear}
                                 </li>
                               ))}
                            </ul>
                         </div>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* At-a-glance stats summary */}
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Altitude', val: `${trek.maxAltitude}m`, icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                 { label: 'Season', val: trek.bestSeason || 'Spring/Autumn', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                 { label: 'Spots', val: `${trek.availableSpots}/${trek.maxCapacity}`, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zM9 7a4 4 0 11-8 0 4 4 0 018 0z' },
                 { label: 'Standard', val: 'Elite', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-2.06 3.42 3.42 0 014.438 0c.64.512 1.481.758 2.304.697a3.42 3.42 0 013.315 3.315 3.42 3.42 0 01-.697 2.304 3.42 3.42 0 000 4.438c.512.64.758 1.481.697 2.304a3.42 3.42 0 01-3.315 3.315 3.42 3.42 0 01-2.304-.697 3.42 3.42 0 00-4.438 0 3.42 3.42 0 01-2.304.697 3.42 3.42 0 01-3.315-3.315 3.42 3.42 0 01.697-2.304 3.42 3.42 0 000-4.438 3.42 3.42 0 01-.697-2.304 3.42 3.42 0 013.315-3.315c.823.061 1.664-.185 2.304-.697z' },
               ].map((stat, i) => (
                 <div key={i} className="bg-surface border border-border p-4 md:p-5 rounded-2xl text-center shadow-lg hover:border-primary/30 transition-all group">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto mb-2 md:mb-3 transition-transform group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon}/></svg>
                    <div className="text-muted text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-base md:text-lg font-black tracking-tight text-foreground">{stat.val}</div>
                 </div>
               ))}
            </div>
          </div>

          {/* Sticky Intent Sidebar (Booking Widget) */}
          <div className="lg:w-[420px] shrink-0">
             <div className="sticky top-24 space-y-8 z-10">
                <BookingWidget trekId={trek.id} price={trek.price} availableSpots={trek.availableSpots} />
                
                <div className="bg-surface/50 backdrop-blur-md border border-border p-8 rounded-3xl items-center flex flex-col text-center">
                   <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                   </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2">24/7 Expert Support</h4>
                    <p className="text-muted text-xs font-medium leading-relaxed">
                       Need help planning your trip? Our support team is available 24/7 for any questions.
                    </p>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
