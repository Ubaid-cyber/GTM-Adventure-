'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import MedicalCautionBanner from '@/app/dashboard/health/MedicalCautionBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils/formatters';
import MedicalFormModal from './medical/MedicalFormModal';
import { 
  startBookingAction, 
  getBookingProgress, 
  cancelPendingBookingAction, 
  updateBookingParticipantsAction,
  initiateRazorpayOrderAction,
  verifyPaymentAction
} from '@/lib/actions/booking-actions';

// Portal Helper for Global Overlays
const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
};

interface BookingWidgetProps {
  trekId: string;
  price: number;
  availableSpots: number;
  inclusions?: string[];
}

export default function BookingWidget(props: BookingWidgetProps) {
  return (
    <Suspense fallback={<div className="p-6 bg-white rounded-xl border border-border animate-pulse h-64"></div>}>
      <BookingWidgetContent {...props} />
    </Suspense>
  );
}

function BookingWidgetContent({ trekId, price, availableSpots, inclusions = [] }: BookingWidgetProps) {
  const [participants, setParticipants] = useState(1);
  const [initialParticipants, setInitialParticipants] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [checkoutStage, setCheckoutStage] = useState<'selection' | 'review'>('selection');
  const [agreedToSafety, setAgreedToSafety] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

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
        const result = await getBookingProgress(retryId);
        if (result.success && result.booking) {
          if (result.booking.status === 'CONFIRMED') {
            setSuccess(true);
          } else if (result.booking.status === 'PENDING') {
            setPendingBookingId(result.booking.id);
            setParticipants(result.booking.participants);
            setInitialParticipants(result.booking.participants);
            setCheckoutStage('review'); // Jump to review if resuming
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

  const handleCancelBooking = async () => {
    if (!pendingBookingId) return;
    setLoading(true);
    try {
      const result = await cancelPendingBookingAction(pendingBookingId);
      if (result.success) {
        setPendingBookingId(null);
        setCheckoutStage('selection');
        setError(null); // Clear errors
        alert('Booking cancelled successfully.');
      } else {
        setError(result.error || 'Failed to cancel booking.');
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
      const orderResult = await initiateRazorpayOrderAction(bookingId);
      if (!orderResult.success || !orderResult.order) {
        throw new Error(orderResult.error || 'Failed to initialize payment');
      }

      const { order, keyId } = orderResult;

      if (order.id.startsWith('mock_')) {
        console.log('SIMULATION MODE: Verification triggering...');
        try {
          const verifyResult = await verifyPaymentAction({
            razorpay_order_id: order.id,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            razorpay_signature: 'mock_sig',
            bookingId
          });
          
          if (verifyResult.success) {
            setSuccess(true);
            setPendingBookingId(null);
          } else {
            setError('Verification failed.');
          }
        } catch (err: any) {
          setError('Verification Request Failed');
        } finally {
          setLoading(false);
        }
        return;
      }

      const options = {
        key: (keyId || '').replace(/['"]+/g, ''),
        amount: order.amount,
        currency: order.currency,
        name: 'GTM Adventures',
        description: 'Expedition Booking',
        order_id: order.id,
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyResult = await verifyPaymentAction({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });
            if (verifyResult.success) {
              setSuccess(true);
              setPendingBookingId(null);
            } else {
              setError('Payment verification failed.');
            }
          } catch(err: any) {
            setError('Verification Request Failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: { color: '#0f172a' },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();

    } catch (err: any) {
      setError(err.message || 'Internal Server Error');
      setLoading(false);
    }
  }

  const handleInitialClick = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    setCheckoutStage('review');
  };

  const finalizeBookingAndPay = async () => {
    if (!agreedToSafety) {
      setError('Please acknowledge the safety agreement.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (pendingBookingId) {
        // Update if participants changed
        if (participants !== initialParticipants) {
          const updateResult = await updateBookingParticipantsAction(pendingBookingId, participants);
          if (!updateResult.success) throw new Error(updateResult.error || 'Failed to update participants');
        }
        await startPaymentFlow(pendingBookingId);
      } else {
        const result = await startBookingAction(trekId, participants);
        if (!result.success || !result.booking) {
          throw new Error(result.error || 'Booking failed');
        }
        
        setPendingBookingId(result.booking.id);
        await startPaymentFlow(result.booking.id);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Success Overlay Scroll Lock - Robust Implementation
  useEffect(() => {
    if (success) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [success]);

  const isSoldOut = availableSpots <= 0;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-surface/80 backdrop-blur-2xl rounded-[32px] border border-border shadow-2xl p-5 md:p-6 group relative overflow-hidden">
        <AnimatePresence mode="wait">
          {success ? (
            <Portal key="success-portal">
              <motion.div 
                key="booking-success-overlay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 backdrop-blur-xl bg-slate-950/40"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative w-full max-w-[720px] bg-background/95 backdrop-blur-3xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-border"
                >

                  <div className="flex flex-row items-stretch min-h-[340px]">
                    {/* Left Side - Success Brand Focus */}
                    <div className="w-1/3 bg-primary/5 border-r border-primary/10 flex flex-col items-center justify-center p-8 gap-6">
                      <div className="relative inline-block">
                        <motion.div 
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", damping: 12, delay: 0.1 }}
                          className="w-20 h-20 bg-primary text-white rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 border-4 border-white"
                        >
                          <ShieldCheck size={40} strokeWidth={2.5} />
                        </motion.div>
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-white text-primary rounded-full text-[8px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                         secure
                      </div>
                    </div>

                    {/* Right Side - Content & Action */}
                    <div className="flex-1 p-10 flex flex-col justify-center space-y-8">
                      <div className="space-y-3">
                        <h3 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                          Great! <span className="text-primary italic">Confirmed.</span>
                        </h3>
                        <p className="text-muted font-bold text-[13px] leading-relaxed max-w-[360px]">
                          Payment processed successfully. Before we launch your dashboard, please complete your health report.
                        </p>
                      </div>


                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => {
                            setSuccess(false);
                            setIsMedicalModalOpen(true);
                          }}
                          className="w-full bg-primary hover:bg-primary-hover text-white py-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/30 flex items-center justify-between group group/btn"
                        >
                          <span>Continue & Submit</span>
                          <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                        
                        <div className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-80 pt-2 text-center">
                          GTM Security // Verification 01
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </Portal>
          ) : checkoutStage === 'selection' ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 bg-red-500/[0.03] py-2.5 px-4 rounded-2xl border border-red-500/10 mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-[0.1em] text-red-500/70">Secure Booking Active</span>
              </div>

              {/* Price Display */}
              <div className="flex items-end justify-between gap-4">
                <div className="shrink-0">
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Trek Price</div>
                  <div className="text-3xl font-black text-foreground tracking-tighter leading-none">
                    {formatINR(price)}<span className="text-[10px] text-muted font-bold tracking-normal ml-1">/seat</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${isSoldOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  {isSoldOut ? 'Sold Out' : `${availableSpots} Open`}
                </span>
              </div>

              {/* Participants Selection */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-muted uppercase tracking-[0.2em] pl-1">Select Participants</label>
                <div className="flex items-center gap-2 bg-background/50 border border-border rounded-2xl p-1.5 shadow-inner">
                  <button
                    onClick={() => setParticipants(p => Math.max(1, p - 1))}
                    disabled={participants <= 1 || isSoldOut}
                    className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-foreground hover:bg-border disabled:opacity-30 transition-all active:scale-90"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4"/></svg>
                  </button>
                  <span className="flex-1 text-center text-lg font-black text-foreground tabular-nums">{participants}</span>
                  <button
                    onClick={() => setParticipants(p => Math.min(availableSpots, p + 1))}
                    disabled={participants >= availableSpots || isSoldOut}
                    className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-foreground hover:bg-border disabled:opacity-30 transition-all active:scale-90"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
              </div>

              {/* Total Display */}
              <div className="pt-4 border-t border-border/50 flex justify-between items-center bg-white/30 -mx-5 px-5 py-3 mt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">Total Price</span>
                 <span className="text-2xl font-black text-primary tracking-tighter">{formatINR(price * participants)}</span>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-3">
                   <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                   {error}
                </motion.div>
              )}

              <button
                onClick={handleInitialClick}
                disabled={loading || isSoldOut}
                className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_20px_rgba(30,58,138,0.2)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Continue to Booking</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setCheckoutStage('selection')} className="text-muted hover:text-primary p-2 -ml-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 19l-7-7 7-7"/></svg>
                </button>
                <h3 className="text-lg font-black uppercase tracking-widest italic">Booking Summary</h3>
              </div>

              {/* Manifest Summary */}
              <div className="bg-surface/50 border border-border rounded-2xl p-6 space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted">
                    <span>Your Booking</span>
                    <span className="text-primary">{participants} Seats Reserved</span>
                 </div>
                 
                 <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-2">What's Included:</div>
                    <div className="grid grid-cols-1 gap-2">
                       {inclusions.length > 0 ? inclusions.slice(0, 4).map((inc, i) => (
                         <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                            {inc}
                         </div>
                       )) : (
                         <div className="text-[10px] text-muted italic">Full inclusions listed in the exploration tab.</div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Safety Agreement */}
              <label className="flex items-start gap-4 p-5 bg-primary/5 border border-primary/10 rounded-2xl cursor-pointer group transition-all hover:bg-primary/10">
                 <input 
                   type="checkbox" 
                   checked={agreedToSafety} 
                   onChange={(e) => setAgreedToSafety(e.target.checked)}
                   className="w-5 h-5 rounded-md border-primary/30 bg-background text-primary focus:ring-primary/20 mt-0.5"
                 />
                 <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                    I acknowledge that mountain trekking involves physical risk. I agree to the <span className="text-primary hover:underline">Safety Rules</span> and medical review process.
                 </span>
              </label>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-3">
                   {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={finalizeBookingAndPay}
                  disabled={loading || !agreedToSafety}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Pay Securely</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </>
                  )}
                </button>

                {pendingBookingId && !loading && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full text-muted hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all py-2"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Shield */}
        <div className="mt-8 flex items-center justify-center gap-4 opacity-20">
           <div className="h-[1px] flex-1 bg-muted"></div>
           <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
           <div className="h-[1px] flex-1 bg-muted"></div>
        </div>
        <p className="text-[8px] text-muted text-center mt-4 font-black uppercase tracking-[0.4em] opacity-40">Encrypted & Protected</p>
      </div>

      {/* Medical Form Modal Overlay */}
      <MedicalFormModal 
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        userEmail={session?.user?.email || ''}
      />
    </>
  );
}
