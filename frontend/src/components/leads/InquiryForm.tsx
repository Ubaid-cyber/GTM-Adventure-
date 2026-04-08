'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2, Mail, User, Phone, MessageSquare } from 'lucide-react';
import { submitLead } from '@/lib/actions/lead-actions';
import { toast } from 'sonner';

interface InquiryFormProps {
  trekId?: string;
  trekTitle?: string;
}

export default function InquiryForm({ trekId, trekTitle }: InquiryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (name.length < 2) {
      const msg = "Please enter your full name";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    if (message.length < 10) {
      const msg = "Please enter a descriptive message (min 10 characters)";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const result = await submitLead({
      ...formData,
      name,
      email,
      message,
      trekId,
      subject: trekTitle ? `Inquiry regarding ${trekTitle}` : 'General Inquiry',
    });

    if (result.success) {
      setSuccess(true);
      toast.success('Inquiry submitted successfully.');
    } else {
      setError(result.error || 'Something went wrong.');
      toast.error(result.error || 'Something went wrong.');
    }
    setLoading(false);
  };

  // 1. Initial State: Sleek CTA Button
  if (!isOpen && !success) {
    return (
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 flex items-center justify-between group shadow-xl hover:bg-slate-900 transition-all max-w-md mx-auto"
      >
        <div className="flex items-center gap-5 text-left">
           <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20 group-hover:bg-blue-600/20 transition-all">
              <MessageSquare className="w-6 h-6 text-blue-500" />
           </div>
           <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none">Need more info?</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ask our adventure experts a question</p>
           </div>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-blue-500/30 transition-all">
           <Send className="w-4 h-4 text-white/20 group-hover:text-blue-500" />
        </div>
      </motion.button>
    );
  }

  // 2. Success State: Confirmation
  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] text-center flex flex-col items-center justify-center space-y-6 max-w-md mx-auto"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 border border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-black tracking-tighter uppercase text-white leading-none">Message Sent!</h3>
          <div className="space-y-1">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
               Thanks for reaching out.
            </p>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
               An adventure expert will contact you soon.
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            setSuccess(false);
            setIsOpen(false);
          }}
          className="pt-4 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-white transition-all hover:scale-105"
        >
          Close Message
        </button>
      </motion.div>
    );
  }

  // 3. Expanded State: The Form
  return (
    <div className="relative max-w-md mx-auto">
      <motion.button 
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(false)}
        className="absolute -top-10 right-0 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
      >
        <span>Close Form</span>
        <div className="w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center">✕</div>
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, height: 80, y: 10 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
           <Send className="w-16 h-16 text-blue-600" />
        </div>

        <div className="relative space-y-6 text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tighter uppercase text-white leading-none">
               Have Questions?
            </h3>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
               Send us a message and we'll help you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Alex Shepard"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-slate-700 outline-none focus:border-blue-600 focus:bg-slate-800/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-slate-700 outline-none focus:border-blue-600 focus:bg-slate-800/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone (Optional)</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-slate-700 outline-none focus:border-blue-600 focus:bg-slate-800/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">How can we help?</label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-5 w-3.5 h-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about your plans..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 pt-4 pb-4 text-xs font-bold text-white placeholder:text-slate-700 outline-none focus:border-blue-600 focus:bg-slate-800/50 transition-all min-h-[100px] resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_12px_24px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Question 
                  <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
