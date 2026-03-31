'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError?: boolean;
}

export default function SuccessModal({ isOpen, onClose, title, message, isError }: SuccessModalProps) {
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

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[720px] bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white/60"
          >
            <div className="flex flex-row items-stretch min-h-[340px]">
              {/* Left Side - Brand Focus */}
              <div className={`w-1/3 flex flex-col items-center justify-center p-8 gap-6 border-r ${
                isError ? 'bg-rose-50/50 border-rose-100' : 'bg-primary/5 border-primary/10'
              }`}>
                <div className="relative inline-block">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className={`w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto shadow-2xl border-4 border-white ${
                      isError ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-primary text-white shadow-primary/30'
                    }`}
                  >
                    {isError ? <ShieldAlert size={40} /> : <CheckCircle2 size={40} />}
                  </motion.div>
                  <div className={`absolute -inset-4 blur-3xl rounded-full -z-10 animate-pulse ${
                    isError ? 'bg-rose-500/20' : 'bg-primary/20'
                  }`}></div>
                </div>
                
                <div className={`flex items-center justify-center gap-2 py-1.5 px-4 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                  isError ? 'bg-white text-rose-500 border-rose-100' : 'bg-white text-primary border-primary-hover/20'
                }`}>
                  <div className={`w-1 h-1 rounded-full animate-pulse ${
                    isError ? 'bg-rose-500' : 'bg-primary'
                  }`}></div>
                  {isError ? 'System Alert' : 'Verified'}
                </div>
              </div>

              {/* Right Side - Content & Action */}
              <div className="flex-1 p-10 flex flex-col justify-center space-y-8">
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                    {title.split(' ').slice(0, -1).join(' ')} <span className={`${isError ? 'text-rose-500' : 'text-primary'} italic`}>{title.split(' ').pop()}</span>
                  </h2>
                  <p className="text-slate-600 font-bold text-[13px] leading-relaxed max-w-[360px]">
                    {message}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={onClose}
                    className={`w-full py-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 group ${
                      isError 
                        ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20' 
                        : 'bg-primary text-white hover:bg-primary-hover shadow-primary/30'
                    }`}
                  >
                    <span>Back to Expedition Control</span>
                  </button>
                  
                  <div className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-80 pt-2 text-center">
                    GTM Adventures // Secure Terminal Result
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
