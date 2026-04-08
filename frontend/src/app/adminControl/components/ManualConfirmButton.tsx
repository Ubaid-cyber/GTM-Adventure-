'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { confirmBookingManually } from '@/lib/actions/admin-actions';

interface ManualConfirmButtonProps {
  bookingId: string;
  status: string;
}

export function ManualConfirmButton({ bookingId, status }: ManualConfirmButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (status !== 'PENDING') return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmBookingManually(bookingId);
      setShowConfirm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
        title="Confirm Payment Manually"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Manual Confirm
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">Verify Payment?</h3>
            </div>
            
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Are you sure you want to mark this booking as <span className="text-white font-bold">CONFIRMED</span>? 
              Only do this if you have manually verified the funds in the Razorpay dashboard.
            </p>

            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
