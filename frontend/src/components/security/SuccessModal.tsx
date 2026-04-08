'use client';

import React, { useEffect } from 'react';
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
  // 🔒 Forceful Scroll Lock (Aggressive Version)
  useEffect(() => {
    if (isOpen) {
      // Prevent both vertical and horizontal scroll
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('touch-action', 'none', 'important');
      
      return () => {
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('touch-action');
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 sm:p-12 overflow-y-auto pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="relative w-full max-w-[500px] bg-white rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.18)] overflow-hidden border border-slate-100 flex flex-col h-auto my-auto pointer-events-auto"
          >
            <div className="flex flex-col sm:flex-row items-stretch min-h-[300px]">
              {/* Left Side - Compact Icon Section */}
              <div className={`w-full sm:w-[30%] flex flex-col items-center justify-center p-8 gap-4 border-b sm:border-b-0 sm:border-r ${
                isError ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <motion.div 
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    isError ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-blue-600 text-white shadow-blue-200'
                  }`}
                >
                  {isError ? <ShieldAlert size={28} /> : <CheckCircle2 size={28} />}
                </motion.div>
                
                <div className={`py-1 px-3 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                  isError ? 'bg-white text-rose-500 border-rose-100' : 'bg-white text-blue-600 border-slate-200'
                }`}>
                  {isError ? 'System Alert' : 'Verified'}
                </div>
              </div>

              {/* Right Side - Simplified Content */}
              <div className="flex-1 p-8 flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <h2 className={`text-2xl font-bold tracking-tight uppercase ${isError ? 'text-rose-600' : 'text-slate-900'}`}>
                    {title}
                  </h2>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={onConfirm || onClose}
                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${
                      isError 
                        ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/10' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10'
                    }`}
                  >
                    <span>{buttonText || 'Continue'}</span>
                    <ArrowRight size={16} />
                  </button>
                  
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-40 text-center">
                    GTM Adventures Security Protocol
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
