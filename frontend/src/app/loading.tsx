'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* New Minimalist Mountain Logo SVG animation */}
        <motion.svg 
          viewBox="0 0 64 64" 
          className="w-24 h-24 text-slate-900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Mountain Lines */}
          <motion.path 
            d="M8 48L24 24M24 24L32 12L44 28M44 28L56 44M18 42L28 32M36 32L48 48" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
                duration: 2, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
            }}
          />
          {/* Summit Sparkle/Star */}
          <motion.circle 
            cx="32" cy="12" r="1.5"
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
            transition={{ 
                delay: 1,
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
            }}
          />
        </motion.svg>
        
        {/* Pulsing ring */}
        <motion.div 
            className="absolute inset-0 border border-slate-100 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
            }}
        />
      </div>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]"
      >
        GTM Adventures
      </motion.p>
    </div>
  );
}
