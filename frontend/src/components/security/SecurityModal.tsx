'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, X, ArrowRight } from 'lucide-react';
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
      if (!res.ok) throw new Error('Verification Error: Connection unstable.');
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
      if (!res.ok) throw new Error('Incorrect code. Please try again.');
      
      setStep('VERIFYING');
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
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
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200"
        >
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-50 p-2 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full"
          >
            <X size={20} strokeWidth={3} />
          </button>
          {/* Main Content Area */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 'VERIFYING' ? (
                <motion.div 
                  key="verifying"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col md:flex-row items-center gap-8 py-4"
                >
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                      <Zap className="w-10 h-10 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                   </div>
                   <div className="space-y-2 text-center md:text-left flex-1">
                      <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">You're all set!</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">Security check complete. We're taking you back to your adventure.</p>
                   </div>
                </motion.div>
              ) : step === 'IDLE' ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col md:flex-row items-center gap-10"
                >
                   <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
                      <ShieldCheck size={30} strokeWidth={2.5} />
                   </div>
                   <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                      <h2 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Security Check</h2>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        To {actionName.toLowerCase() || 'continue'}, we'll send a quick verification code to your phone.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                              Phone Number
                            </span>
                          </div>
                          <input 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                          />
                        </div>

                        {error && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-normal">
                             Error: {error}
                          </div>
                        )}

                        <button 
                          onClick={handleRequestOtp} 
                          disabled={loading || !phone}
                          className="w-full bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 group hover:shadow-xl disabled:opacity-50 h-14"
                        >
                        {loading ? 'Sending...' : 'Send Code to my Phone'}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
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
                  <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                       <Zap size={20} />
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-lg font-black text-slate-900 tracking-tight italic uppercase leading-none">Confirm it's you</h2>
                      <p className="text-slate-400 font-medium text-xs mt-1">
                         Code sent to <span className="text-slate-900 font-bold border-b border-slate-900/10">{phone.slice(-4) || 'XXXX'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <OTPInputGroup 
                      value={otp} 
                      onChange={(val) => { setOtp(val); if(error) setError(null); }} 
                      hasError={isInvalid} 
                    />
                    
                    <div className="flex items-center justify-between px-1">
                      {isInvalid ? (
                        <p className="text-rose-500 text-[11px] font-bold leading-relaxed flex items-center gap-2">
                           <span className="w-1 h-3 bg-rose-500 rounded-full" />
                           {error}
                        </p>
                      ) : (
                        <p className="text-slate-400 text-[10px] font-black tracking-widest tabular-nums uppercase opacity-60">
                          Expires in: <span className={timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-slate-900'}>{formatTime(timeLeft)}</span>
                        </p>
                      )}
                      
                      <button 
                        onClick={handleRequestOtp}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-hover transition-colors"
                      >
                        Resend
                      </button>
                    </div>

                    <button 
                      onClick={isInvalid ? () => { setError(null); setOtp(''); } : handleVerify}
                      disabled={loading || (otp.length < 6 && !isInvalid)}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl
                        ${isInvalid 
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                          : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20 disabled:opacity-30'
                        }`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                      ) : isInvalid ? 'Try Another Code' : 'Verify code'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-slate-50 p-6 md:px-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto">
             <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80 hidden sm:block">
                Secure Verification System
             </div>
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-80">Identity Verification Active</span>
             </div>
             <button onClick={onClose} className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Cancel
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
