'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, Lock, User } from 'lucide-react';

export default function AdminLoginGate() {
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
        const is2FA = result.error.includes('2FA_REQUIRED') || 
                      result.error.includes('CredentialsSignin') || 
                      result.error === '2FA_REQUIRED';

        if (is2FA) {
          setStep('2fa');
        } else if (result.error === 'ACCOUNT_LOCKED') {
          setError('SYSTEM LOCKED. Exceeded attempt limit.');
        } else {
          setError('UNAUTHORIZED. Invalid credentials.');
        }
      } else {
        // If they don't have 2FA enabled, just reload to activate the HQ
        window.location.reload();
      }
    } catch {
      setError('CONNECTION FAILURE.');
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
        if (result.error === 'INVALID_2FA_CODE') {
          setError('Code expired or invalid. Check authenticator.');
        } else {
          setError('AUTHENTICATION FAILED.');
        }
      } else {
        // Instant HQ Unlock: Reloading triggers AdminLayout to drop the Gate and render the Sidebar
        window.location.reload();
      }
    } catch {
      setError('CONNECTION FAILURE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Deep Dark Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
             <ShieldAlert className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Management</h1>
          <p className="text-white/40 text-[10px] mt-2 font-bold uppercase tracking-[0.2em] whitespace-nowrap">
            {step === 'credentials' ? 'Staff Login Required' : 'Security Verification Required'}
          </p>
        </div>

        <div className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl p-8 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form 
                key="credentials"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleCredentialsSubmit} 
                className="space-y-5"
              >
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block px-1">Admin Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                      className="w-full px-10 py-3 rounded-xl border border-white/10 bg-black/50 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="admin@gtm-adventures.com" 
                    />
                    <User className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block px-1">Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      className="w-full px-10 py-3 rounded-xl border border-white/10 bg-black/50 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="••••••••" 
                    />
                    <Lock className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-3 h-3" />}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="2fa"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handle2FASubmit} 
                className="space-y-6"
              >
                <div className="text-center">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 block">Authenticator Code</label>
                  <input 
                    type="text" 
                    value={totpCode} 
                    onChange={(e) => setTotpCode(e.target.value)} 
                    required
                    autoFocus
                    className="w-full px-4 py-4 rounded-xl border-2 border-white/10 focus:border-blue-500 bg-black/50 text-center text-3xl font-black tracking-[0.4em] text-white focus:outline-none transition-all shadow-inner"
                    placeholder="000 000" 
                    maxLength={6}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Access Dashboard'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setStep('credentials')}
                  className="w-full text-center text-[10px] font-bold text-white/30 hover:text-white transition-colors tracking-widest uppercase"
                >
                  Back to Login
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
            >
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
