'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MedicalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

// Portal Helper for Global Overlays
const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
};

import { updateUserMedicalProfileAction } from '@/lib/actions/user-actions';

export default function MedicalFormModal({ isOpen, onClose, userEmail }: MedicalFormModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showOther, setShowOther] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setError('');
    }
  }, [isOpen]);

  // Modal Scroll Lock - Robust Implementation
  useEffect(() => {
    if (isOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      vitals: {
        height: formData.get('height'),
        weight: formData.get('weight'),
        bloodGroup: formData.get('bloodGroup'),
        bp: formData.get('bp'),
      },
      history: {
        heart: formData.get('heart') === 'on',
        asthma: formData.get('asthma') === 'on',
        hypertension: formData.get('hypertension') === 'on',
        diabetes: formData.get('diabetes') === 'on',
        allergies: formData.get('allergies') === 'on',
        other: formData.get('otherDetails') || 'None'
      }
    };

    try {
      const result = await updateUserMedicalProfileAction(data);

      if (!result.success) throw new Error(result.error || 'Transmission Failure');
      
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
            />

            {/* Modal Card */}
            <motion.div 
              key="medical-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[720px] bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden border border-white/60"
            >
              {step === 'form' ? (
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
                  {/* Header */}
                  <div className="px-10 py-5 border-b border-slate-100/50 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center border border-primary/10">
                        <Activity size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 italic tracking-tight uppercase leading-none mb-1">
                          Health & Vitals
                        </h2>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] pl-0.5">
                          Verification // Phase 02
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100/50 hover:bg-slate-200 rounded-full transition-all active:scale-90">
                      <X size={16} className="text-slate-500" />
                    </button>
                  </div>

                  {/* Form Body - Scrollable */}
                  <div className="flex-1 overflow-y-auto px-10 py-6 space-y-6 custom-scrollbar">
                    {/* Vitals Grid - Three Column Landscape Stack */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                      {[
                        { name: 'height', label: 'Height (cm)', placeholder: '175', type: 'number' },
                        { name: 'weight', label: 'Weight (kg)', placeholder: '70', type: 'number' },
                        { name: 'bp', label: 'Blood Pressure', placeholder: '120/80', type: 'text' },
                      ].map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{field.label}</label>
                          <input 
                            name={field.name} 
                            type={field.type} 
                            placeholder={field.placeholder} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none" 
                            required 
                          />
                        </div>
                      ))}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Blood Group</label>
                        <div className="relative">
                          <select name="bloodGroup" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none appearance-none" required>
                            <option value="">Select...</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ArrowRight size={14} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* History Checkboxes - Landscape Grid */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-4 mb-1">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Medical History Check</label>
                        <div className="h-px flex-1 bg-slate-100"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { id: 'heart', label: 'Cardiovascular' },
                          { id: 'asthma', label: 'Respiratory' },
                          { id: 'hypertension', label: 'High BP' },
                          { id: 'diabetes', label: 'Diabetes' },
                          { id: 'allergies', label: 'Allergies' },
                        ].map(item => (
                          <label key={item.id} className="flex items-center gap-4 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl cursor-pointer hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div className="relative flex items-center justify-center">
                              <input type="checkbox" name={item.id} className="peer w-4.5 h-4.5 rounded-md border-2 border-slate-200 text-primary focus:ring-0 appearance-none transition-all checked:bg-primary checked:border-primary" />
                              <ShieldCheck size={11} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide group-hover:text-primary transition-colors">{item.label}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-4 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl cursor-pointer hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                          <div className="relative flex items-center justify-center">
                            <input type="checkbox" name="other" checked={showOther} onChange={(e) => setShowOther(e.target.checked)} className="peer w-4.5 h-4.5 rounded-md border-2 border-slate-200 text-primary focus:ring-0 appearance-none transition-all checked:bg-primary checked:border-primary" />
                            <ShieldCheck size={11} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide group-hover:text-primary transition-colors">Other Files</span>
                        </label>
                      </div>
                    </div>

                    {showOther && (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
                        <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest pl-1">Details</label>
                        <textarea name="otherDetails" required={showOther} rows={2} className="w-full bg-rose-50/10 border border-rose-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none resize-none transition-all" placeholder="..." />
                      </motion.div>
                    )}

                    {error && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-[8px] font-black text-rose-600 uppercase tracking-[0.2em] text-center italic">
                        {error}
                      </motion.div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="px-10 py-5 border-t border-slate-100/50 bg-slate-50/50 flex flex-row items-center justify-between gap-6">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-[120px]">Verified Safety Transmission Profile</p>
                    <button type="submit" disabled={saving} className="flex-1 max-w-[300px] bg-primary text-white py-4.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-primary-hover hover:shadow-xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]">
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Transmit Securely</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Success State - Integrated Brand Identity */
                <div className="flex flex-row items-stretch min-h-[340px]">
                  {/* Left Side - Brand Focus */}
                  <div className="w-1/3 bg-primary/5 border-r border-primary/10 flex flex-col items-center justify-center p-8 gap-6">
                    <div className="relative inline-block">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-20 h-20 bg-primary text-white rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-primary/40 border-4 border-white"
                      >
                        <ShieldCheck size={40} strokeWidth={2.5} />
                      </motion.div>
                      <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-white text-primary rounded-full text-[8px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                       verified
                    </div>
                  </div>

                  {/* Right Side - Content & Action */}
                  <div className="flex-1 p-10 flex flex-col justify-center space-y-8">
                    <div className="space-y-3">
                      <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                        Data <span className="text-primary italic">Received</span>
                      </h2>
                      <p className="text-slate-600 font-bold text-[13px] leading-relaxed max-w-[360px]">
                        Your health verification is complete. Our medical officers will review your profile and update your clearance shortly.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => router.push('/dashboard/bookings')}
                        className="bg-primary hover:bg-primary-hover text-white py-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/30 flex items-center justify-between group w-full"
                      >
                        <span>Launch Expedition Dashboard</span>
                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                      </button>
                      
                      <div className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-80 pt-2 text-center">
                        GTM Adventures // Professional Grade Safety
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
