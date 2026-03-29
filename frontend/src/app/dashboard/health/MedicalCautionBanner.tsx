'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface MedicalCautionBannerProps {
  trekId: string;
}

export default function MedicalCautionBanner({ trekId }: MedicalCautionBannerProps) {
  const { data: session } = useSession();
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    if (!session || !trekId || hasDismissed) return;

    setLoading(true);
    fetch('/api/user/medical/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trekId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.warning) {
          setWarning(data.warning);
          setIsOpen(true);
        }
      })
      .catch(err => console.error('Safety check failed:', err))
      .finally(() => setLoading(false));
  }, [session, trekId, hasDismissed]);

  const handleClose = () => {
    setIsOpen(false);
    setHasDismissed(true);
  };

  const handleContactMedical = () => {
    // Placeholder for contact logic (could open a chat, mailto, or a specific modal)
    window.location.href = `mailto:medical@gtmadventures.com?subject=Medical Consultation Request for Trek ${trekId}`;
  };

  if (!isOpen || !warning || loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-border animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 relative">
        
        {/* Top Accent Strip */}
        <div className="h-2 bg-rose-500 w-full"></div>

        <div className="p-8 md:p-12">
          {/* Header Icon & Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center ring-4 ring-rose-50/50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight leading-tight">Mission Safety Advisory</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Medical Override Active</span>
              </div>
            </div>
          </div>

          {/* Warning Content */}
          <div className="space-y-6">
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {warning}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button 
                onClick={handleContactMedical}
                className="bg-primary hover:bg-primary-hover text-white py-4 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Connect with GTM Medical Team
              </button>

              <button 
                onClick={handleClose}
                className="bg-white hover:bg-surface text-foreground py-4 px-6 rounded-2xl font-bold text-sm border border-border transition-all active:scale-95 flex items-center justify-center"
              >
                Acknowledge & Proceed
              </button>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <p className="text-[10px] text-muted text-center mt-8 font-medium italic">
            * This mission-specific guidance is based on your current Health Passport. Please ensure your vitals are updated.
          </p>
        </div>

        {/* Close Button UI (Optional corner X) */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-muted hover:text-foreground transition-colors p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
}
