'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const CountdownTimer = ({ createdAt }: { createdAt: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const expireTime = new Date(createdAt).getTime() + 10 * 60 * 1000;
    
    if (Date.now() >= expireTime) {
      setExpired(true);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = expireTime - now;
      
      if (difference <= 0) {
        clearInterval(interval);
        setExpired(true);
      } else {
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [createdAt]);

  if (expired) return <span className="text-red-500 font-bold ml-2">Timeout Expired</span>;
  return (
    <span className="text-amber-700 font-bold font-mono bg-amber-50 px-2 py-0.5 rounded ml-2 text-xs border border-amber-200 inline-flex items-center gap-1">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {timeLeft}
    </span>
  );
};

export default function BookingsClient() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
          headers: { 'x-user-email': session.user.email }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setBookings(data);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session?.user?.email]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">My Adventures</h1>
            <p className="text-muted mt-1 font-medium">Manage and track your upcoming Himalayan expeditions.</p>
          </div>
          <Link href="/treks" className="hidden sm:inline-flex bg-white hover:bg-gray-50 border border-border text-foreground px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm">
            Book Another Trek
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-border shadow-sm flex gap-6 animate-pulse">
                <div className="w-32 h-24 bg-surface rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 bg-surface rounded w-1/3" />
                  <div className="h-3 bg-surface rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-border shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Expedition Booked Yet</h2>
            <p className="text-muted max-w-md mx-auto mb-8 font-medium">
              You haven't booked any treks yet. Discover the breathtaking heights of the Himalayas and start your journey today.
            </p>
            <Link href="/treks" className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-full font-bold transition-colors shadow-sm inline-block">
              Explore Treks
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <div key={booking.id} className="group bg-white rounded-2xl p-5 sm:p-6 border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center">
                
                {/* Image */}
                <div className={`w-full sm:w-40 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-surface relative ${booking.status === 'CANCELLED' ? 'grayscale opacity-70' : ''}`}>
                  {booking.trek?.coverImage && (
                    <img src={booking.trek.coverImage} alt={booking.trek.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  {booking.status === 'PENDING' && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] uppercase tracking-wide font-extrabold px-2 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Action Required
                    </div>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] uppercase tracking-wide font-extrabold px-2 py-1 rounded-full shadow-sm z-10">
                      Confirmed
                    </div>
                  )}
                  {booking.status === 'CANCELLED' && (
                    <div className="absolute top-2 left-2 bg-slate-800 text-white text-[10px] uppercase tracking-wide font-extrabold px-2 py-1 rounded-full shadow-sm z-10">
                      Payment Failed
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold text-foreground truncate">{booking.trek?.title}</h3>
                    <div className="text-right shrink-0">
                      <span className="block text-lg font-extrabold text-foreground">${booking.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted font-medium mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {booking.trek?.location}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border"></div>
                    <div>{booking.trek?.durationDays} Days</div>
                    <div className="w-1 h-1 rounded-full bg-border"></div>
                    <div>{booking.participants} {booking.participants > 1 ? 'Trekkers' : 'Trekker'}</div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs font-semibold text-muted bg-surface px-3 py-1.5 rounded-lg border border-border">
                      Booked on {formatDate(booking.createdAt)}
                      {booking.status === 'PENDING' && <CountdownTimer createdAt={booking.createdAt} />}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {booking.status === 'CONFIRMED' && booking.expedition && (
                        <Link 
                          href={`/dashboard/expeditions/${booking.expedition.id}`}
                          className="flex items-center gap-2 text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-full transition-all group/btn"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Mission Control
                        </Link>
                      )}
                      
                      {booking.status === 'PENDING' && (
                        <Link 
                          href={`/treks/${booking.trek?.id}?retry=${booking.id}`}
                          className="text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full transition-colors ml-2 shadow-sm flex items-center gap-1.5"
                        >
                          Complete Payment &rarr;
                        </Link>
                      )}

                      {booking.status === 'CANCELLED' && (
                        <Link 
                          href={`/treks/${booking.trek?.id}`}
                          className="text-sm font-bold border-2 border-border bg-white text-foreground hover:bg-gray-50 px-5 py-2 rounded-full transition-colors ml-2 shadow-sm"
                        >
                          Retry Booking
                        </Link>
                      )}

                      {booking.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => alert(`Detailed itineraries, pack-lists, and offline-map downloads for ${booking.trek?.title} are scheduled for release in Module 8 (Expedition Management)!`)}
                          className="text-sm font-bold text-primary hover:text-primary-hover transition-colors pr-2"
                        >
                          View Details &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
