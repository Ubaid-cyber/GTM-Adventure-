'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, X, ArrowRight, Smartphone, CheckCircle2 } from 'lucide-react';
import OTPInputGroup from './OTPInputGroup';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionName: string;
  phone: string;
}

export default function SecurityModal({ isOpen, onClose, onVerified, actionName, phone: initialPhone }: SecurityModalProps) {
  const [step, setStep] = useState<'IDLE' | 'OTP_SENT' | 'VERIFYING'>('IDLE');
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  // 🔒 Forceful Scroll Lock (Aggressive Version)
  useEffect(() => {
    if (isOpen) {
      // Prevent both vertical and horizontal scroll
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('touch-action', 'none', 'important');
      
      return () => {
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('touch-action');
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
  }, [initialPhone]);

  const startTimer = useCallback(() => {
    setTimeLeft(120);
  }, []);

  useEffect(() => {
    if (step === 'OTP_SENT' && otp.length === 6 && !error && !loading) {
      handleVerify();
    }
  }, [otp]);

  useEffect(() => {
    if (step !== 'OTP_SENT' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, action: 'SEND_OTP' }),
      });
      if (!res.ok) throw new Error('Could not send code. Please check your connection.');
      setStep('OTP_SENT');
      setOtp('');
      startTimer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp, action: 'VERIFY_OTP' }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Incorrect code. Please try again.');
      
      setStep('VERIFYING');
      setTimeout(() => {
        onVerified();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isInvalid = !!error;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12 overflow-y-auto overflow-x-hidden">
        {/* Backdrop: Professional Soft Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto"
        />
        
        {/* Modal: Big Company Aesthetic (True Compact Version) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 20 }}
          className="relative w-full max-w-[400px] bg-background rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.6)] overflow-hidden border border-border flex flex-col pointer-events-auto h-auto my-auto"
        >
          {/* Top Close - Subtle & Clean */}
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-50 p-2 text-muted hover:text-foreground hover:bg-surface rounded-full transition-all"
          >
            <X size={18} />
          </button>


          <div className="p-8 pt-10 text-center">
            <AnimatePresence mode="wait">
              {step === 'VERIFYING' ? (
                <motion.div 
                  key="verifying"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 py-4"
                >
                   <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/5">
                      <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-bold text-foreground tracking-tight">Identity Verified</h3>
                      <p className="text-muted text-xs">Returning to your dashboard...</p>
                   </div>

                </motion.div>
              ) : step === 'IDLE' ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                   <div className="w-16 h-16 bg-primary/10 text-primary rounded-[22px] flex items-center justify-center mx-auto shadow-sm ring-4 ring-primary/5">
                      <ShieldCheck size={28} />
                   </div>
                   
                   <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">Confirm Identity</h2>
                      <p className="text-muted text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                        Enter your phone number to receive a 6-digit verification code.
                      </p>
                   </div>

                   
                   <div className="space-y-4 pt-2">
                     <div className="space-y-1.5 text-left">
                         <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">
                            Phone Number
                         </label>
                         <div className="relative">
                           <input 
                             type="tel"
                             value={phone}
                             onChange={(e) => setPhone(e.target.value)}
                             className="w-full bg-surface border border-border rounded-xl px-5 py-3.5 text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                             placeholder="+91..."
                           />
                           <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
                         </div>

                     </div>

                     {error && (
                       <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-semibold text-rose-600">
                          {error}
                       </div>
                     )}

                      <button 
                        onClick={handleRequestOtp} 
                        disabled={loading || !phone}
                        className="w-full bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-xs tracking-tight transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 h-14"
                      >
                        {loading ? 'Sending code...' : 'Send Verification Code'}
                        {!loading && <ArrowRight size={16} />}
                      </button>

                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Enter Code</h2>
                    <p className="text-muted text-sm">
                       We've sent a 6-digit code to **{phone.slice(-4)}**
                    </p>
                  </div>


                  <div className="space-y-5">
                    <div className="py-1">
                      <OTPInputGroup 
                        value={otp} 
                        onChange={(val) => { setOtp(val); if(error) setError(null); }} 
                        hasError={isInvalid} 
                      />
                    </div>
                                        <div className="flex items-center justify-between px-1">
                       <p className="text-muted text-[11px] font-medium tabular-nums">
                         {isInvalid ? (
                           <span className="text-rose-500 font-bold">{error}</span>
                         ) : (
                           <>Expires in: <span className="text-foreground font-bold">{formatTime(timeLeft)}</span></>
                         )}
                       </p>
                      
                       <button 
                        onClick={handleRequestOtp}
                        className="text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
                       >
                         Resend Code
                       </button>
                    </div>


                    <button 
                      onClick={isInvalid ? () => { setError(null); setOtp(''); } : handleVerify}
                      disabled={loading || (otp.length < 6 && !isInvalid)}
                      className={`w-full py-4 rounded-xl font-bold text-xs tracking-tight transition-all shadow-xl h-14
                        ${isInvalid 
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 disabled:opacity-30'
                        }`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                      ) : isInvalid ? 'Try Another Code' : 'Verify & Continue'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-surface/50 p-4 flex items-center justify-center gap-2 border-t border-border mt-auto">
             <div className="flex items-center gap-2 text-[9px] font-bold text-muted uppercase tracking-widest opacity-60">
                <ShieldCheck size={10} className="text-emerald-500" />
                Secure Identity Verification
             </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
