'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, Lock, User, Stethoscope, HeartPulse } from 'lucide-react';

export default function MedicalLoginGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email, 
        password, 
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('2FA_REQUIRED')) {
          setStep('2fa');
        } else if (result.error === 'ACCOUNT_LOCKED') {
          setError('SECURITY LOCKOUT. Exceeded attempt limit.');
        } else {
          setError('DENIED. Medical credentials invalid.');
        }
      } else {
        window.location.reload();
      }
    } catch {
      setError('HQ LINK FAILURE.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email, 
        password, 
        totpCode,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'INVALID_2FA_CODE' ? 'Sync mismatch. Check code.' : 'AUTH FAILURE.');
      } else {
        window.location.reload();
      }
    } catch {
      setError('HQ LINK FAILURE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Bio-Digital Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative group">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Stethoscope className="w-8 h-8 text-blue-500 relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Medical Control</h1>
          <p className="text-white/40 text-[10px] mt-3 font-black uppercase tracking-[0.4em] whitespace-nowrap">
            {step === 'credentials' ? 'Clinical Officer Access Only' : 'Neural 2FA Verification Req'}
          </p>
        </div>

        <div className="bg-[#111] rounded-[32px] border border-white/10 shadow-3xl p-10 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form 
                key="credentials"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCredentialsSubmit} 
                className="space-y-6"
              >
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2.5 block px-1">Officer Email</label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                      className="w-full px-12 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all"
                      placeholder="medical@gtm-adventures.com" 
                    />
                    <User className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2.5 block px-1">Clearance Key</label>
                  <div className="relative group">
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      className="w-full px-12 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all"
                      placeholder="••••••••" 
                    />
                    <Lock className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? 'Validating...' : 'Authenticate'}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="2fa"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handle2FASubmit} 
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-full animate-pulse">
                      <HeartPulse className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 block">Medical Sync Code</label>
                  <input 
                    type="text" 
                    value={totpCode} 
                    onChange={(e) => setTotpCode(e.target.value)} 
                    required
                    autoFocus
                    className="w-full px-4 py-5 rounded-2xl border-2 border-white/5 focus:border-blue-500 bg-white/[0.02] text-center text-4xl font-black tracking-[0.5em] text-white focus:outline-none transition-all shadow-inner"
                    placeholder="000000" 
                    maxLength={6}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? 'Linking...' : 'Complete Approval'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setStep('credentials')}
                  className="w-full text-center text-[10px] font-black text-white/20 hover:text-white transition-colors tracking-[0.3em] uppercase"
                >
                  Return to Key Entry
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
            >
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></div>
               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</span>
            </motion.div>
          )}
        </div>
        
        <p className="mt-8 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.4em]">
          End-to-End Encrypted Secure Medical Node
        </p>
      </div>
    </div>
  );
}
