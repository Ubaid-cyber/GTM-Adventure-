'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { formatINR } from '@/lib/utils/formatters';

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY:     'bg-emerald-100 text-emerald-700',
  MODERATE: 'bg-blue-100 text-blue-700',
  HARD:     'bg-orange-100 text-orange-700',
  EXTREME:  'bg-red-100 text-red-700',
};

import { getTreksAction } from '@/lib/actions/trek-actions';

export default function TreksClient() {
  const [treks, setTreks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchMode, setSearchMode] = useState<'browse' | 'keyword' | 'semantic'>('browse');

  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minDays, setMinDays] = useState('');
  const [sort, setSort] = useState('');

  const hasActiveFilters = Boolean(difficulty || minPrice || maxPrice || minDays || sort);
  const clearFilters = () => { setDifficulty(''); setMinPrice(''); setMaxPrice(''); setMinDays(''); setSort(''); };

  const debouncedQuery     = useDebounce(query, 300);
  const debouncedDifficulty  = useDebounce(difficulty, 300);
  const debouncedMinPrice  = useDebounce(minPrice, 500);
  const debouncedMaxPrice  = useDebounce(maxPrice, 500);
  const debouncedMinDays   = useDebounce(minDays, 500);
  const debouncedSort      = useDebounce(sort, 300);

  const fetchTreks = useCallback(async (pageToFetch = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true); else setLoading(true);
    try {
      const data = await getTreksAction({
        q: debouncedQuery,
        difficulty: debouncedDifficulty,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
        minDays: debouncedMinDays,
        sort: debouncedSort,
        page: pageToFetch,
        limit: 6
      });

      if (isLoadMore) setTreks(prev => [...prev, ...data.treks]);
      else setTreks(data.treks || []);

      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      setSearchMode(data.searchMode as any || 'browse');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [debouncedQuery, debouncedDifficulty, debouncedMinPrice, debouncedMaxPrice, debouncedMinDays, debouncedSort]);

  useEffect(() => { fetchTreks(1, false); }, [fetchTreks]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !loadingMore) fetchTreks(pagination.page + 1, true);
  };

  return (
    <div className="min-h-screen bg-surface pt-0">

      {/* ── Hero Image ── */}
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=85&w=2070"
          alt="Elite Himalayan Trekking Expeditions - GTM Adventures"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
        <div className="absolute bottom-8 left-6 md:bottom-12 md:left-10 max-w-2xl px-4 md:px-0">
          <h1 className="text-white text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none drop-shadow-2xl">
            Featured <br />
            <span className="text-primary">Treks</span>
          </h1>
          <p className="text-white/60 mt-4 text-base md:text-xl font-medium tracking-wide">
             Discover the standard of mountain trekking and adventure.
          </p>
        </div>
      </div>

      {/* ── Main Content Card ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-border">

          {/* AI Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search destinations, peaks, or plan with our Trip Planner..."
                className="w-full pl-11 pr-4 py-3.5 rounded-full border border-border bg-surface text-foreground text-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-primary/20 group shrink-0">
              <div className="relative flex items-center justify-center">
                <span className="text-lg relative z-10 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse">
                  ✨
                </span>
                {/* Intense Neon Bloom */}
                <div className="absolute inset-0 w-6 h-6 bg-blue-400 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              </div>
              <span className="relative z-10 ml-1">
                {searchMode === 'semantic' ? 'Planning...' : 'Plan My Trip'}
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-border mb-6">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters:</span>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-[12px] text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer w-full sm:w-auto"
                value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MODERATE">Moderate</option>
                <option value="HARD">Hard</option>
                <option value="EXTREME">Extreme</option>
              </select>

              <select
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-[12px] text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer w-full sm:w-auto"
                value={sort} onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-3 w-full sm:w-auto">
              <input
                type="number" placeholder="Min ₹" value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
              <input
                type="number" placeholder="Max ₹" value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
              <input
                type="number" placeholder="Days" value={minDays}
                onChange={e => setMinDays(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors ml-auto pt-2 sm:pt-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Reset
              </button>
            )}
          </div>

          {/* ── Main Grid Layout ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Column: Treks */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">Featured Treks</h2>
                {!loading && (
                  <span className="text-sm text-muted">{treks.length} treks found</span>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
                      <div className="bg-surface h-52"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-surface rounded w-3/4"></div>
                        <div className="h-3 bg-surface rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : treks.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl">
                  <p className="text-muted font-medium">No treks found. Try adjusting your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {treks.map((trek) => (
                    <div key={trek.id} className="group rounded-2xl border border-border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="relative h-48 overflow-hidden bg-surface">
                        {trek.coverImage && (
                          <img
                            src={trek.coverImage}
                            alt={trek.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-foreground text-base mb-0.5 leading-tight">
                          {trek.title}
                        </h3>
                        <p className="text-[13px] text-muted mb-5">
                          {trek.difficulty.charAt(0) + trek.difficulty.slice(1).toLowerCase()} · {trek.durationDays} Days
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-black text-slate-900 tracking-tight">{formatINR(trek.price)}<span className="text-[10px] text-slate-400 align-top ml-0.5">+</span></span>
                          <Link
                            href={`/treks/${trek.id}`}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/10 active:scale-95"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More */}
              {pagination.page < pagination.totalPages && (
                <div className="mt-10 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="border border-border text-foreground hover:border-primary hover:text-primary px-10 py-3 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Treks'}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:w-[450px] shrink-0 space-y-8">
              {/* Our Services */}
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-foreground">Our Services</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { 
                      icon: (
                        <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                        </svg>
                      ),
                      title: 'Expert Guides', 
                      desc: 'Expert enter-ion ivsvkirs guides, imnumission.' 
                    },
                    { 
                      icon: (
                        <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04a11.357 11.357 0 00-1.026 5.413c0 5.38 3.515 9.928 8.351 11.439a11.977 11.977 0 008.351-11.44c0-1.928-.47-3.742-1.307-5.322z" />
                        </svg>
                      ),
                      title: 'Safety First', 
                      desc: 'Shranr-quality safety arroni, scommlsss.' 
                    },
                    { 
                      icon: (
                        <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                        </svg>
                      ),
                      title: 'Seamless Logistics', 
                      desc: 'Get semless logistics expenues to help.' 
                    },
                  ].map(s => (
                    <div key={s.title} className="flex flex-col gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                        {s.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-[12px] mb-1 leading-tight">{s.title}</h3>
                        <p className="text-[10px] text-muted leading-relaxed line-clamp-3 font-medium">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                  <h2 className="text-lg font-bold text-foreground mb-4">Testimonial</h2>
                  <div className="bg-surface/30 rounded-xl p-5 border border-border/50">
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-muted italic leading-relaxed mb-4">
                      "The most organized and breathtaking experience I've ever had in the mountains. Every detail was perfect."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">RD</div>
                      <div>
                        <div className="text-[11px] font-bold text-foreground">Robert Davids</div>
                        <div className="text-[9px] text-muted">Everest Base Camp Trek</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className="h-12"></div>
    </div>
  );
}
