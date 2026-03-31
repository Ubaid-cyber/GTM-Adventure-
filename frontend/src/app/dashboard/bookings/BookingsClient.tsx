'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SecurityModal from '@/components/security/SecurityModal';
import SuccessModal from '@/components/security/SuccessModal';
import RefundTracker from '@/components/bookings/RefundTracker';
import { ShieldAlert, Trash2 } from 'lucide-react';

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
  
  // Security Perimeter State
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [targetBooking, setTargetBooking] = useState<{ id: string, title: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
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
  };

  useEffect(() => {
    fetchBookings();
  }, [session?.user?.email]);

  const handleCancelInitiate = (id: string, title: string) => {
     setTargetBooking({ id, title });
     setSecurityModalOpen(true);
  };

  const executeCancellation = async () => {
    if (!targetBooking) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: targetBooking.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Success Modal instead of Alert
      setIsError(false);
      setResultTitle('Trek Cancelled Successfully');
      setResultMessage(`Your refund of ${data.refundPercentage}% has been processed and should arrive shortly. We're sorry to see you go!`);
      setResultModalOpen(true);
      fetchBookings();
    } catch (err: any) {
      setIsError(true);
      setResultTitle('Cancellation Failed');
      setResultMessage(err.message || 'We could not cancel your booking at this time. Please try again.');
      setResultModalOpen(true);
    } finally {
      setCancelling(false);
      setTargetBooking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 relative overflow-hidden">
      {/* HUD Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">My Upcoming <span className="text-primary">Treks</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Manage your confirmed bookings and upcoming expeditions</p>
          </div>
          <Link href="/treks" className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-800 shadow-xl shadow-slate-900/10">
            Book New Trek
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex gap-8 animate-pulse">
                <div className="w-48 h-32 bg-slate-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-4 py-4">
                  <div className="h-6 bg-slate-100 rounded-full w-1/3" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border border-slate-200 shadow-sm">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-10">
              <ShieldAlert className="w-12 h-12 text-primary/20" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">No Upcoming Trips</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-10 font-bold tracking-tight">
              You haven't booked any adventures yet. Explore our trekking destinations to get started.
            </p>
            <Link href="/treks" className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 inline-block hover:bg-primary-hover transition-all">
              Browse Treks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="group bg-white rounded-[40px] p-6 sm:p-8 border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] transition-all duration-700 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                
                {/* Image / Unit Preview */}
                <div className={`relative w-full lg:w-64 h-40 rounded-[32px] overflow-hidden shrink-0 bg-slate-50 ${booking.status === 'CANCELLED' ? 'grayscale opacity-40' : ''}`}>
                  {booking.trek?.coverImage && (
                    <img src={booking.trek.coverImage} alt={booking.trek.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  )}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      booking.status === 'CONFIRMED' ? 'bg-emerald-500 text-white' : 
                      booking.status === 'PENDING' ? 'bg-amber-500 text-white animate-pulse' : 
                      'bg-slate-900 text-white'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:text-primary transition-colors">{booking.trek?.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Booking ID: #{booking.id.slice(-8)}</span>
                         <span>•</span>
                         <span>{booking.participants} Trekkers</span>
                      </div>
                    </div>
                    <div className="flex flex-col text-right">
                      <div className="text-3xl font-black text-slate-900 tracking-tighter">
                         <span className="text-sm text-slate-300 mr-2 uppercase font-bold tracking-widest">VAL</span>
                         ₹{booking.totalPrice}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        ₹{(booking as any).basePrice || Math.round(booking.totalPrice / 1.05)} + ₹{(booking as any).gstAmount || Math.round(booking.totalPrice - (booking.totalPrice / 1.05))} GST
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 mb-8 mt-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{booking.trek?.location}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{booking.trek?.durationDays} Days</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       Booked On {formatDate(booking.createdAt)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                      {booking.status === 'CONFIRMED' && booking.expedition && (
                          <Link 
                          href={`/dashboard/expeditions/${booking.expedition.id}`}
                          className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all group/btn shadow-xl shadow-slate-900/10"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          Expedition Details
                        </Link>
                      )}
                      
                      {booking.status === 'PENDING' && (
                        <Link 
                          href={`/treks/${booking.trek?.id}?retry=${booking.id}`}
                          className="flex items-center gap-3 px-8 py-3.5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all"
                        >
                          Complete Payment
                        </Link>
                      )}

                      {booking.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleCancelInitiate(booking.id, booking.trek?.title)}
                          className="flex items-center gap-2 px-6 py-3.5 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancel Booking
                        </button>
                      )}

                      {booking.status === 'CANCELLED' && (booking as any).refundAmount > 0 && (
                        <div className="w-full">
                           <RefundTracker 
                              status={(booking as any).refundStatus || 'Processing'} 
                              refundAmount={(booking as any).refundAmount} 
                              updatedAt={booking.updatedAt} 
                           />
                        </div>
                      )}
                    </div>

                    {booking.status === 'PENDING' && (
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Pending</span>
                         <CountdownTimer createdAt={booking.createdAt} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Perimeter Component */}
        <SecurityModal 
          isOpen={securityModalOpen}
          onClose={() => setSecurityModalOpen(false)}
          onVerified={executeCancellation}
          actionName="Cancel Trek & Process Refund"
          phone={(session?.user as any)?.phone || ''} 
        />

        {/* Result/Success Modal */}
        <SuccessModal 
          isOpen={resultModalOpen}
          onClose={() => setResultModalOpen(false)}
          title={resultTitle}
          message={resultMessage}
          isError={isError}
        />
      </div>
    </div>
  );
}
