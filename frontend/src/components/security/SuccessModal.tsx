'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError?: boolean;
  buttonText?: string;
  onConfirm?: () => void;
}

export default function SuccessModal({ isOpen, onClose, title, message, isError, buttonText, onConfirm }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
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
            className="relative w-full max-w-[600px] bg-white rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200"
          >
            <div className="flex flex-row items-stretch min-h-[380px]">
              {/* Left Side - Brand Focus (Elite Split) */}
              <div className={`w-[35%] flex flex-col items-center justify-center p-6 md:p-10 gap-8 border-r ${
                isError ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="relative inline-block">
                  <motion.div 
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, delay: 0.1 }}
                    className={`w-16 h-16 md:w-24 md:h-24 rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border-4 border-white ${
                      isError ? 'bg-rose-600 text-white shadow-rose-600/30' : 'bg-[#1e3a8a] text-white shadow-blue-900/30'
                    }`}
                  >
                    {isError ? <ShieldAlert size={32} /> : <CheckCircle2 size={32} />}
                  </motion.div>
                </div>
                
                <div className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                  isError ? 'bg-white text-rose-500 border-rose-100' : 'bg-white text-[#1e3a8a] border-slate-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isError ? 'bg-rose-500' : 'bg-[#1e3a8a]'
                  }`}></div>
                  {isError ? 'System Alert' : 'Verified'}
                </div>
              </div>

              {/* Right Side - Content & Action */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center space-y-8">
                <div className="space-y-4 pr-4">
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-[0.9] flex flex-col items-start">
                    <span className="opacity-40 break-words">{title.split(' ').slice(0, -1).join(' ')}</span>
                    <span className={`${isError ? 'text-rose-600' : 'text-[#1e3a8a]'} italic break-words`}>
                      {title.split(' ').pop()}
                    </span>
                  </h2>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[280px]">
                    {message}
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <button 
                    onClick={onConfirm || onClose}
                    className={`w-full py-4.5 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-[0.98] ${
                      isError 
                        ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20' 
                        : 'bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-blue-900/20'
                    }`}
                  >
                    <span>{buttonText || 'Back to My Bookings'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60 text-center">
                    GTM Adventures // {isError ? 'Secure Terminal Result' : 'Bookings Verified'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
