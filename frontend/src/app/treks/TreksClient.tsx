'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

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
  const [maxDays, setMaxDays] = useState('');
  const [sort, setSort] = useState('');

  const hasActiveFilters = Boolean(difficulty || minPrice || maxPrice || minDays || maxDays || sort);
  const clearFilters = () => { setDifficulty(''); setMinPrice(''); setMaxPrice(''); setMinDays(''); setMaxDays(''); setSort(''); };

  const debouncedQuery = useDebounce(query, 300);
  const debouncedDifficulty = useDebounce(difficulty, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);
  const debouncedMinDays = useDebounce(minDays, 500);
  const debouncedMaxDays = useDebounce(maxDays, 500);
  const debouncedSort = useDebounce(sort, 300);

  const fetchTreks = useCallback(async (pageToFetch = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true); else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (debouncedDifficulty) params.append('difficulty', debouncedDifficulty);
      if (debouncedMinPrice) params.append('minPrice', debouncedMinPrice);
      if (debouncedMaxPrice) params.append('maxPrice', debouncedMaxPrice);
      if (debouncedMinDays) params.append('minDays', debouncedMinDays);
      if (debouncedMaxDays) params.append('maxDays', debouncedMaxDays);
      if (debouncedSort) params.append('sort', debouncedSort);
      params.append('page', pageToFetch.toString());
      params.append('limit', '6');

      // ← Now calls the Express backend directly
      const res = await fetch(`${BACKEND_URL}/api/treks?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch treks');
      const data = await res.json();

      if (isLoadMore) setTreks(prev => [...prev, ...data.treks]);
      else setTreks(data.treks || []);

      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
      setSearchMode(data.searchMode || 'browse');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [debouncedQuery, debouncedDifficulty, debouncedMinPrice, debouncedMaxPrice, debouncedMinDays, debouncedMaxDays, debouncedSort]);

  useEffect(() => { fetchTreks(1, false); }, [fetchTreks]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !loadingMore) fetchTreks(pagination.page + 1, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
          Discover Your Next Adventure
        </h1>

        <div className="max-w-3xl mx-auto mb-10 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg className="w-7 h-7 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Ask AI: e.g. 'I want a short beginner trek with sunrise views'"
            className="w-full pl-16 pr-16 py-5 rounded-full border-2 border-purple-100 bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 shadow-lg text-[1.1rem] text-gray-800 placeholder-gray-400 transition-all duration-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Refine Your Search</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg bg-red-50">
                Clear Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 bg-white" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MODERATE">Moderate</option>
              <option value="HARD">Hard</option>
              <option value="EXTREME">Extreme</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 bg-white" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">AI Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_asc">Shortest First</option>
              <option value="duration_desc">Longest First</option>
            </select>
            <input type="number" className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Min Price ($)" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <input type="number" className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Max Price ($)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            <input type="number" className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Min Days" value={minDays} onChange={e => setMinDays(e.target.value)} />
            <input type="number" className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Max Days" value={maxDays} onChange={e => setMaxDays(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-6 space-y-3"><div className="h-6 bg-gray-200 rounded w-3/4"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-full"></div></div>
              </div>
            ))}
          </div>
        ) : treks.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">No treks found matching your criteria.</div>
        ) : (
          <>
            {searchMode === 'semantic' && (
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-xl flex items-center text-purple-800">
                <span className="text-2xl mr-3">✨</span>
                <div><h3 className="font-bold">AI Semantic Search Active</h3><p className="text-sm">Showing treks conceptually matching your query using Google Gemini AI.</p></div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {treks.map((trek) => (
                <div key={trek.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl group">
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    {trek.coverImage && <img src={trek.coverImage} alt={trek.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    {trek._relevance && <div className="absolute top-4 left-4 bg-purple-600/90 px-3 py-1 rounded-full text-xs font-bold text-white">✨ {trek._relevance}% Match</div>}
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 uppercase">{trek.difficulty}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">{trek.title}</h3>
                    <div className="text-gray-500 text-sm mb-4">{trek.location} · {trek.durationDays} Days</div>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">{trek.description}</p>
                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                      <span className="text-2xl font-bold text-green-600">${trek.price}<span className="text-gray-400 text-sm font-normal ml-1">/ person</span></span>
                      <Link href={`/treks/${trek.id}`} className="text-green-600 font-semibold text-sm hover:text-green-700 flex items-center">
                        Details <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {pagination.page < pagination.totalPages && (
              <div className="mt-12 text-center">
                <button onClick={handleLoadMore} disabled={loadingMore} className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50 px-8 py-3 rounded-full font-bold transition-colors">
                  {loadingMore ? 'Loading...' : 'Load More Treks'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
