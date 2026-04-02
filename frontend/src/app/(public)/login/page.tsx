'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Mail, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rawCallback = searchParams?.get('callbackUrl') || '/dashboard';
  const callbackUrl = rawCallback.startsWith('/') ? rawCallback : `/${rawCallback}`;

  // 1. Traditional Email Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email, password, redirect: false, callbackUrl,
      });
      
      if (result?.error) {
        // Broad check for 2FA signal in various Auth.js error formats
        const is2FA = result.error.includes('2FA_REQUIRED') || 
                      result.error.includes('CredentialsSignin') || 
                      result.error === '2FA_REQUIRED';

        if (is2FA) {
          setShow2FA(true);
        } else if (result.error === 'ACCOUNT_LOCKED') {
          setError('Account locked for security. Please try again in 10 minutes.');
        } else {
          console.error('[AuthDebug] Browser-side Error:', result.error);
          setError('Invalid email or password.');
        }
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. 2FA (TOTP) Submission
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
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === 'INVALID_2FA_CODE') {
          setError('Invalid 2FA code. Please check your authenticator app.');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Phone OTP Phase 1: Send
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, action: 'SEND_OTP' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Phone OTP Phase 2: Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 3. SECURE SESSION HANDSHAKE (NextAuth)
      const res = await signIn('credentials', {
        phone,
        code: otp,
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (res?.error) {
        throw new Error('Invalid verification code. Please check and try again.');
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 py-2 px-4 rounded-full bg-white border border-slate-200 shadow-sm mb-6"
          >
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <div className="w-3 h-3 bg-white rotate-45"></div>
            </div>
            <span className="font-black text-xs text-slate-900 tracking-widest uppercase">GTM ADVENTURES</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {show2FA ? 'Security Verification' : 'Login to Adventure'}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-tight whitespace-nowrap">
            {show2FA ? 'Enter your 6-digit authenticator code' : 'Manage your bookings and upcoming treks'}
          </p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10">
          
          {/* TAB TOGGLE (Only show if not in 2FA mode) */}
          {!show2FA && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => setTab('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button 
                onClick={() => setTab('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Phone
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {show2FA ? (
              <motion.form 
                key="2fa"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handle2FASubmit} 
                className="space-y-6"
              >
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                     <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Authenticator Code</label>
                  <input 
                    type="text" 
                    value={totpCode} 
                    onChange={(e) => setTotpCode(e.target.value)} 
                    required
                    autoFocus
                    className="w-full px-5 py-4 rounded-2xl border-2 border-primary/20 bg-primary/5 text-center text-3xl font-black tracking-[0.3em] text-slate-900 focus:outline-none focus:border-primary transition-all"
                    placeholder="000 000" 
                    maxLength={6}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>

                <button 
                  type="button" 
                  onClick={() => setShow2FA(false)}
                  className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors text-center"
                >
                  Back to Login
                </button>
              </motion.form>
            ) : tab === 'email' ? (
              <motion.form 
                key="email"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleEmailSubmit} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                      placeholder="commander@gtm.com" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                   <button type="button" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Forgot Password?</button>
                   <Link href="/signup" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Create Account</Link>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="phone"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} 
                className="space-y-6"
              >
                {step === 'phone' ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Mobile Number</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        required
                        className="w-full px-12 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="Enter 10-digit or +CountryCode number" 
                      />
                      <Smartphone className="w-4 h-4 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                       <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Verification Code Sent</label>
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      required
                      className="w-full px-5 py-4 rounded-2xl border-2 border-primary/20 bg-primary/5 text-center text-2xl font-black tracking-[0.2em] text-slate-900 focus:outline-none focus:border-primary transition-all"
                      placeholder="ENTER CODE" 
                      maxLength={10}
                    />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent to {phone}</p>
                  </div>
                )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : (step === 'phone' ? 'Send Verification Code' : 'Verify & Login')}
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                
                {step === 'otp' && (
                   <button 
                    type="button" 
                    onClick={() => setStep('phone')}
                    className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors text-center"
                  >
                    Use different number
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3"
            >
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider leading-tight">{error}</span>
            </motion.div>
          )}

          {!show2FA && (
            <div className="mt-10 pt-10 border-t border-slate-100">
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Or continue with</p>
              <button 
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 py-3.5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-all hover:bg-slate-50 shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                Continue with Google
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          GTM ADVENTURES • SINCE 2024
        </p>
      </div>
    </div>
  );
}
