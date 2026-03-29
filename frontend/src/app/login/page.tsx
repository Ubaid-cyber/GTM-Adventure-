'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email, password, redirect: true, callbackUrl: '/dashboard/bookings',
      });
      if ((result as any)?.error) setError('Invalid email or password');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2L2 26h28L16 2z"/>
            </svg>
            <span className="font-bold text-xl text-foreground">GTM-Adventure</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted text-sm mt-1">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center gap-3 my-5">
              <div className="flex-1 border-t border-border"></div>
              <span className="text-xs text-muted font-medium">or continue with</span>
              <div className="flex-1 border-t border-border"></div>
            </div>
            <button onClick={() => signIn('google', { callbackUrl: '/dashboard/bookings' })}
              className="w-full border border-border bg-white hover:bg-surface py-2.5 rounded-lg flex items-center justify-center gap-3 text-sm font-medium text-foreground transition-colors">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
