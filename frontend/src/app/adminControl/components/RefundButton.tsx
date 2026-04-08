'use client';

import React, { useState } from 'react';
import { adminRefundBooking } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

interface RefundButtonProps {
  bookingId: string;
  status: string;
  refundAmount?: number | null;
}

export function RefundButton({ bookingId, status, refundAmount }: RefundButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to process a refund for this booking? This action is irreversible on Razorpay.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await adminRefundBooking(bookingId);
      if (result.success) {
        toast.success(`Refund of ₹${result.refundAmount} processed successfully.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Refund failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'CANCELLED') {
    return (
      <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
        Refunded {refundAmount ? `₹${refundAmount}` : ''}
      </div>
    );
  }

  if (status !== 'CONFIRMED') return null;

  return (
    <button
      onClick={handleRefund}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-rose-500/10 text-white/60 hover:text-rose-500 border border-white/5 hover:border-rose-500/20 rounded-md text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
    >
      <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Processing...' : 'Refund'}
    </button>
  );
}
