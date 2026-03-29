'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import MedicalCautionBanner from '@/app/dashboard/health/MedicalCautionBanner';

interface BookingWidgetProps {
  trekId: string;
  price: number;
  availableSpots: number;
}

export default function BookingWidget(props: BookingWidgetProps) {
  return (
    <Suspense fallback={<div className="p-6 bg-white rounded-xl border border-border animate-pulse h-64"></div>}>
      <BookingWidgetContent {...props} />
    </Suspense>
  );
}

function BookingWidgetContent({ trekId, price, availableSpots }: BookingWidgetProps) {
  const [participants, setParticipants] = useState(1);
  const [initialParticipants, setInitialParticipants] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const retryId = searchParams.get('retry');

  // Load existing booking if retrying
  useEffect(() => {
    async function resumeBooking() {
      if (!retryId || !session?.user) return;
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${retryId}`, {
          headers: { 'x-user-email': (session?.user?.email as string) ?? '' }
        });
        const data = await res.json();
        if (res.ok && data.booking) {
          if (data.booking.status === 'CONFIRMED') {
            setSuccess(true);
          } else if (data.booking.status === 'PENDING') {
            setPendingBookingId(data.booking.id);
            setParticipants(data.booking.participants);
            setInitialParticipants(data.booking.participants);
          }
        }
      } catch (err) {
        console.error('Failed to resume booking:', err);
      } finally {
        setLoading(false);
      }
    }
    resumeBooking();
  }, [retryId, session?.user]);

  // Cleanup pending booking if component unmounts or user leaves without paying
  // Note: Real apps might use a background worker for this, but here we offer a manual cancel.

  const handleCancelBooking = async () => {
    if (!pendingBookingId) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${pendingBookingId}/cancel`, { 
        method: 'POST',
        headers: { 'x-user-email': (session?.user?.email as string) ?? '' }
      });
      if (res.ok) {
        setPendingBookingId(null);
        setError('Booking cancelled and spots released.');
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const startPaymentFlow = async (bookingId: string) => {
    setError(null);
    setLoading(true);
    try {
      // 2. Create Razorpay order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/razorpay/order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': (session?.user?.email as string) ?? ''
        },
        body: JSON.stringify({ bookingId })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize payment gateway');

      if (orderData.order.id.startsWith('mock_')) {
        console.log('Skipping Razorpay Modal - SIMULATION MODE');
        setLoading(true);
        // Simulate immediate success verification
        try {
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/razorpay/verify`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-email': (session?.user?.email as string) ?? ''
            },
            body: JSON.stringify({
              razorpay_order_id: orderData.order.id,
              razorpay_payment_id: `mock_pay_${Date.now()}`,
              razorpay_signature: 'mock_sig',
              bookingId
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            setSuccess(true);
            setPendingBookingId(null);
            // Removed automatic redirect to keep user on the new "Step 2" UI
          } else {
            setError(verifyData.error || 'Mock Verification failed.');
          }
        } catch (err: any) {
          setError('Mock Verification Request Failed');
        } finally {
          setLoading(false);
        }
        return;
      }

      // 3. Open Razorpay Checkout overlay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'GTM Adventures',
        description: 'Trek Booking Secure Checkout',
        order_id: orderData.order.id,
        handler: async function (response: any) {
          setLoading(true);
          // 4. Verify signature on success
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/razorpay/verify`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-user-email': (session?.user?.email as string) ?? ''
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setSuccess(true);
              setPendingBookingId(null);
              // Removed automatic redirect to keep user on the new "Step 2" UI
            } else {
              setError(verifyData.error || 'Payment verification failed. Please check your dashboard.');
            }
          } catch(err: any) {
            setError('Verification Request Failed: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError('Payment cancelled. You can retry or release your reserved spots.');
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#1e3a8a',
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment Failed');
      });
      razorpayInstance.open();

    } catch (err: any) {
      setError(err.message || 'Internal Server Error');
      setLoading(false);
    }
  }

  const handleBookingClick = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // If we already have a pending booking record, check if participants changed
    if (pendingBookingId) {
      if (participants !== initialParticipants) {
        setLoading(true);
        try {
          const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${pendingBookingId}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-email': (session?.user?.email as string) ?? ''
            },
            body: JSON.stringify({ participants })
          });
          const updateData = await updateRes.json();
          if (!updateRes.ok) throw new Error(updateData.error || 'Failed to update expedition manifest');
          setInitialParticipants(participants);
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
          return;
        }
      }
      startPaymentFlow(pendingBookingId);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Create the pending booking & secure spots
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': (session?.user?.email as string) ?? ''
        },
        body: JSON.stringify({ trekId, participants }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      
      const bId = data.booking.id;
      setPendingBookingId(bId);
      
      // Proceed to payment
      await startPaymentFlow(bId);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    } 
  };

  const isSoldOut = availableSpots <= 0;

  const [showOther, setShowOther] = useState(false);
  const [healthSubmitted, setHealthSubmitted] = useState(false);

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500">
        <div className="bg-slate-950 border border-cyan-500/20 rounded-[2rem] max-w-lg w-full shadow-[0_0_50px_rgba(34,211,238,0.1)] animate-in zoom-in-95 duration-700 relative overflow-hidden flex flex-col max-h-[90vh]">
          {/* Clinical HUD Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl"></div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                      {healthSubmitted ? 'Mission Secured' : 'Bio-Sync Required'}
                    </h2>
                    <p className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-widest mt-1">GTM-MED_CORPS // PHASE_02</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Auth_ID</div>
                   <div className="text-[11px] font-mono font-black text-white">#GS-9201-CL</div>
                </div>
              </div>
              
              {!healthSubmitted && (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const vitals = {
                      height: formData.get('height')?.toString(),
                      weight: formData.get('weight')?.toString(),
                      bloodGroup: formData.get('bloodGroup')?.toString(),
                      bp: formData.get('bp')?.toString()
                    };
                    const history = {
                      heart: formData.get('heart') === 'on',
                      asthma: formData.get('asthma') === 'on',
                      hypertension: formData.get('hypertension') === 'on',
                      diabetes: formData.get('diabetes') === 'on',
                      other: formData.get('other') === 'on' ? formData.get('otherDetails')?.toString() : ''
                    };
                    
                    setLoading(true);
                    try {
                      const res = await fetch('/api/user/medical', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vitals, history })
                      });
                      if (res.ok) {
                        setHealthSubmitted(true);
                        setTimeout(() => router.push('/dashboard/health'), 2000);
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Body_Height (cm)</label>
                      <input name="height" type="number" required placeholder="175" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm font-mono font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Body_Weight (kg)</label>
                      <input name="weight" type="number" required placeholder="70" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm font-mono font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Blood_Matrix</label>
                      <select name="bloodGroup" required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none appearance-none transition-all cursor-pointer">
                        <option value="">Matrix...</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Systemic_BP</label>
                      <input name="bp" placeholder="120/80" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm font-mono font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"/>
                    </div>
                  </div>
      
                  <div className="space-y-4 pt-6 border-t border-slate-900">
                     <label className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] block mb-4">Risk Factor Analysis</label>
                     <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'heart', label: 'Cardiac History' },
                          { id: 'asthma', label: 'Respiratory' },
                          { id: 'hypertension', label: 'High BP' },
                          { id: 'diabetes', label: 'Endocrine' },
                        ].map(item => (
                          <label key={item.id} className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:border-cyan-500/30 group transition-all">
                            <input type="checkbox" name={item.id} className="w-4 h-4 rounded-md border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 transition-all"/>
                            <span className="text-[11px] font-black text-slate-500 group-hover:text-cyan-400 transition-colors uppercase tracking-widest">{item.label}</span>
                          </label>
                        ))}
                        <label className="col-span-2 flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:border-cyan-500/30 group transition-all">
                          <input 
                            type="checkbox" 
                            name="other" 
                            checked={showOther}
                            onChange={(e) => setShowOther(e.target.checked)}
                            className="w-4 h-4 rounded-md border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 transition-all"
                          />
                          <span className="text-[11px] font-black text-slate-500 group-hover:text-cyan-400 transition-colors uppercase tracking-widest">Other Bio-Anomalies</span>
                        </label>
                     </div>

                     {showOther && (
                       <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                         <label className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] pl-1">Detailed Log Requirement</label>
                         <textarea 
                           name="otherDetails" 
                           required 
                           placeholder="Detail conditions, surgeries, or limitations..."
                           className="w-full bg-slate-900 border border-rose-500/20 rounded-xl px-5 py-4 text-sm font-medium text-white focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all placeholder:text-slate-700 h-28 resize-none"
                         />
                       </div>
                     )}
                  </div>
      
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 py-5 rounded-xl font-black text-xs shadow-[0_0_25px_rgba(34,211,238,0.2)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.2em] relative overflow-hidden"
                  >
                    {loading ? (
                       <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Initialize Clearance</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}

              {healthSubmitted && (
                <div className="py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
                   <div className="w-24 h-24 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                      <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                      </svg>
                   </div>
                   <div className="space-y-2">
                     <p className="text-2xl font-black text-white uppercase tracking-tighter">Bio-Sync Complete</p>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Medical authorization pending surgeon review.</p>
                   </div>
                </div>
              )}
              
              <div className="mt-8 flex items-center justify-center gap-4 opacity-30">
                 <div className="h-[1px] flex-1 bg-slate-800"></div>
                 <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">Protocol GS-9 // Secured</p>
                 <div className="h-[1px] flex-1 bg-slate-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 sticky top-24">
        {/* Safety Warning */}
        <MedicalCautionBanner trekId={trekId} />

        {/* Price */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-3xl font-bold text-foreground">${price}</span>
            <span className="text-sm text-muted ml-1">/ person</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isSoldOut ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
            {isSoldOut ? 'Sold Out' : `${availableSpots} spots left`}
          </span>
        </div>

        {/* Participants */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Number of Trekkers</label>
          <div className="flex items-center gap-3 border border-border rounded-lg p-1">
            <button
              onClick={() => setParticipants(p => Math.max(1, p - 1))}
              disabled={participants <= 1 || isSoldOut}
              className="w-10 h-10 rounded-md bg-surface flex items-center justify-center text-foreground hover:bg-border disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"/>
              </svg>
            </button>
            <span className="flex-1 text-center font-semibold text-foreground">{participants}</span>
            <button
              onClick={() => setParticipants(p => Math.min(availableSpots, p + 1))}
              disabled={participants >= availableSpots || isSoldOut}
              className="w-10 h-10 rounded-md bg-surface flex items-center justify-center text-foreground hover:bg-border disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-4 border-t border-border mb-4">
          <span className="text-sm font-medium text-muted">Total</span>
          <span className="text-xl font-bold text-foreground">${price * participants}</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleBookingClick}
            disabled={loading || isSoldOut}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : pendingBookingId ? 'Retry Payment' : (isSoldOut ? 'Sold Out' : (!session?.user ? 'Login to Book' : 'Secure Checkout'))}
          </button>

          {pendingBookingId && !loading && (
            <button
              onClick={handleCancelBooking}
              className="w-full bg-surface hover:bg-border text-muted py-2 rounded-lg font-medium text-xs transition-colors border border-border"
            >
              Cancel & Release Spots
            </button>
          )}
        </div>

        <p className="text-[10px] text-muted text-center mt-4 uppercase tracking-widest font-bold">Secure Bank-Level Encryption</p>
      </div>
    </>
  );
}
