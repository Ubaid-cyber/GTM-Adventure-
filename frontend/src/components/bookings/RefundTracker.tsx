'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, CreditCard, ReceiptIndianRupee } from 'lucide-react';
import { formatINR } from '@/lib/utils/formatters';

interface RefundTrackerProps {
  status: string;
  refundAmount: number;
  updatedAt: string;
}

export default function RefundTracker({ status, refundAmount, updatedAt }: RefundTrackerProps) {
  // Simulate steps based on time or status
  // In a real app, these would come from the backend
  const steps = [
    { id: 1, label: 'Cancelled', icon: Check, active: true, completed: true },
    { id: 2, label: 'Initiated', icon: ReceiptIndianRupee, active: true, completed: true },
    { id: 3, label: 'Processing', icon: Clock, active: true, completed: false },
    { id: 4, label: 'Credited', icon: CreditCard, active: false, completed: false },
  ];

  return (
    <div className="mt-8 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary italic font-black">
            ₹
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Estimated Refund</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">{formatINR(refundAmount)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Refund in Progress</p>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="relative flex justify-between items-start pt-2 px-2">
        {/* Background Line */}
        <div className="absolute top-[22px] left-0 right-0 h-0.5 bg-slate-200 z-0 mx-8"></div>
        
        {steps.map((step, idx) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center group w-1/4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${
              step.completed 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' 
                : step.active 
                ? 'bg-white border-primary text-primary animate-pulse'
                : 'bg-white border-slate-200 text-slate-300'
            }`}>
              <step.icon size={14} />
            </div>
            <p className={`mt-3 text-[9px] font-black uppercase tracking-widest text-center ${
              step.active ? 'text-slate-900' : 'text-slate-400'
            }`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100/50">
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
          * Refunds usually take <span className="text-slate-900">5-7 business days</span> to reach your bank account. Note that GST is non-refundable per government policy, but we have included it in your recovery where applicable.
        </p>
      </div>
    </div>
  );
}
