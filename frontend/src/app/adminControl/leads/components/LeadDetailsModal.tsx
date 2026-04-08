'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, MapPin, MessageSquare, Trash2, CheckCircle2, XCircle, Clock, ExternalLink, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { LeadStatus } from '@/types/leads';
import { format } from 'date-fns';
import { updateLeadStatus, deleteLead } from '@/lib/actions/lead-actions';
import { toast } from 'sonner';

interface LeadDetailsModalProps {
  lead: any;
  onClose: () => void;
  onUpdate: () => void;
}

const COMPANY_INFO = {
  EMAIL: 'info@gtmadventures.com',
  PHONE: '9682614480',
  WHATSAPP: '919682614480' // Country code added for API
};

const STATUS_CONFIG: Record<LeadStatus, { color: string; bg: string; icon: any }> = {
  NEW: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Clock },
  CONTACTED: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Phone },
  QUALIFIED: { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: CheckCircle2 },
  CONVERTED: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  LOST: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle },
};

export default function LeadDetailsModal({ lead, onClose, onUpdate }: LeadDetailsModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [showContactMenu, setShowContactMenu] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleEmail = () => {
    const subject = encodeURIComponent(`Inquiry Follow-up: ${lead.trek?.title || 'General Inquiry'}`);
    const body = encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out regarding your interest in the trek. I'd love to help you with any questions you might have.\n\nBest regards,\nGTM Adventure Team\n${COMPANY_INFO.EMAIL}\n${COMPANY_INFO.PHONE}`);
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
    setShowContactMenu(false);
  };

  const handleWhatsApp = () => {
    if (!lead.phone) {
      toast.error('No phone number available');
      return;
    }
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${lead.name}, this is from GTM Adventure regarding your inquiry about ${lead.trek?.title || 'our treks'}. How can we assist you today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    setShowContactMenu(false);
  };

  const handleForwardToOffice = () => {
    const subject = encodeURIComponent(`Lead Forward: ${lead.name} - ${lead.trek?.title || 'General'}`);
    const body = encodeURIComponent(`--- LEAD DETAILS ---\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'N/A'}\nTrek: ${lead.trek?.title || 'General'}\nMessage: ${lead.message}\n\nForwarded via GTM Admin Hub.`);
    window.location.href = `mailto:${COMPANY_INFO.EMAIL}?subject=${subject}&body=${body}`;
    setShowContactMenu(false);
  };

  const handleShare = () => {
    const summary = `
--- GTM LEAD SUMMARY ---
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'N/A'}
Trek: ${lead.trek?.title || 'General'}
Message: ${lead.message}

Company Contact: ${COMPANY_INFO.EMAIL} | ${COMPANY_INFO.PHONE}
    `.trim();
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Lead details copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
    setShowContactMenu(false);
  };

  const handleStatusUpdate = async (newStatus: LeadStatus) => {
    setLoading(true);
    const result = await updateLeadStatus(lead.id, newStatus);
    if (result.success) {
      toast.success(`Status updated to ${newStatus}`);
      onUpdate();
      onClose();
    } else {
      toast.error('Failed to update status');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    setLoading(true);
    const result = await deleteLead(lead.id);
    if (result.success) {
      toast.success('Inquiry deleted successfully');
      onUpdate();
      onClose();
    } else {
      toast.error('Failed to delete inquiry');
    }
    setLoading(false);
  };

  const status = STATUS_CONFIG[lead.status as LeadStatus] || STATUS_CONFIG.NEW;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${status.bg}`}>
                <status.icon className={`w-6 h-6 ${status.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{lead.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                    Status: {lead.status}
                  </span>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    ID: {lead.id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
              <X className="w-5 h-5 text-white/40 group-hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 group">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-white/80">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-3 group">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-white/80">{lead.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 group">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-white/80">
                      Logged: {format(new Date(lead.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Trek Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 group">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-bold text-white">{lead.trek?.title || 'General Journey Inquiry'}</span>
                  </div>
                  {lead.trekId && (
                     <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 ml-7">
                        Trek Reference ID: {lead.trekId.slice(-8)}
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Customer Message</h3>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                <p className="text-sm font-medium leading-relaxed text-white/70 whitespace-pre-wrap">
                  {lead.message}
                </p>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="pt-4 border-t border-white/5 space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Actions</h3>
               
               <div className="flex flex-wrap gap-3">
                  {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as LeadStatus[]).map((s) => (
                     <button
                        key={s}
                        disabled={loading || lead.status === s}
                        onClick={() => handleStatusUpdate(s as any)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                           lead.status === s 
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                           : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-50'
                        }`}
                     >
                        Mark as {s}
                     </button>
                  ))}
               </div>

               <div className="flex items-center justify-between pt-4">
                  <button
                    disabled={loading}
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600/20 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Inquiry
                  </button>
                  
                  <div className="relative">
                      <AnimatePresence>
                        {showContactMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full right-0 mb-3 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 origin-bottom-right"
                          >
                            <div className="space-y-1">
                              <button
                                onClick={handleEmail}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group/item"
                              >
                                <div className="p-2 bg-blue-500/10 rounded-lg group-hover/item:bg-blue-500/20 transition-colors">
                                  <Mail className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Send Email</p>
                                  <p className="text-[9px] text-white/40 font-medium">Open mail application</p>
                                </div>
                              </button>

                              <button
                                onClick={handleWhatsApp}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group/item"
                              >
                                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover/item:bg-emerald-500/20 transition-colors">
                                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-white uppercase tracking-widest">WhatsApp Chat</p>
                                  <p className="text-[9px] text-white/40 font-medium">Start direct conversation</p>
                                </div>
                              </button>

                              <button
                                onClick={handleForwardToOffice}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group/item"
                              >
                                <div className="p-2 bg-amber-500/10 rounded-lg group-hover/item:bg-amber-500/20 transition-colors">
                                  <Send className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Forward to Office</p>
                                  <p className="text-[9px] text-white/40 font-medium">Send details to {COMPANY_INFO.EMAIL}</p>
                                </div>
                              </button>

                              <button
                                onClick={handleShare}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group/item"
                              >
                                <div className="p-2 bg-purple-500/10 rounded-lg group-hover/item:bg-purple-500/20 transition-colors">
                                  {copied ? <Check className="w-4 h-4 text-purple-500" /> : <Copy className="w-4 h-4 text-purple-500" />}
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Copy Summary</p>
                                  <p className="text-[9px] text-white/40 font-medium">System clipboard export</p>
                                </div>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={() => setShowContactMenu(!showContactMenu)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                          showContactMenu 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        Contact Customer
                        <ExternalLink className={`w-3.5 h-3.5 transition-transform duration-300 ${showContactMenu ? 'rotate-180 scale-110' : ''}`} />
                      </button>
                   </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
