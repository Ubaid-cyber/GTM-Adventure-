'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import SuccessModal from '@/components/security/SuccessModal';

interface MedicalProfile {
  vitals?: {
    height?: string;
    weight?: string;
    bloodGroup?: string;
    bp?: string;
  };
  history?: {
    heart?: boolean;
    asthma?: boolean;
    hypertension?: boolean;
    diabetes?: boolean;
    allergies?: boolean;
    other?: string;
  };
  status?: 'NONE' | 'AWAITING_CLEARANCE' | 'IN_REVIEW' | 'CLEARED';
  medicalNotes?: string;
}

export default function HealthDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showOther, setShowOther] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch('/api/user/medical')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        if (data?.history?.other) setShowOther(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load health profile:', err);
        setLoading(false);
      });
  }, [session]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const hasOther = formData.get('other') === 'on';
    const updatedProfile = {
      vitals: {
        height: formData.get('height')?.toString() || '',
        weight: formData.get('weight')?.toString() || '',
        bloodGroup: formData.get('bloodGroup')?.toString() || '',
        bp: formData.get('bp')?.toString() || '',
      },
      history: {
        heart: formData.get('heart') === 'on',
        asthma: formData.get('asthma') === 'on',
        hypertension: formData.get('hypertension') === 'on',
        diabetes: formData.get('diabetes') === 'on',
        allergies: formData.get('allergies') === 'on',
        other: hasOther ? formData.get('otherDetails')?.toString() : '',
      }
    };

    try {
      const res = await fetch('/api/user/medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        setSuccess(true);
        setIsModalOpen(true);
        // @ts-ignore
        setProfile(prev => ({
          ...prev,
          ...updatedProfile,
          status: Object.values(updatedProfile.history).some(v => v === true || (typeof v === 'string' && v.length > 0)) ? 'AWAITING_CLEARANCE' : (prev?.status || 'NONE')
        }));
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to update passport');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 px-4 py-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">Medical Information</h1>
          <p className="text-muted text-sm max-w-lg font-medium">Your health details for a safe mountain experience. Keep your vitals updated for a better trekking journey.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {profile?.status === 'CLEARED' && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Cleared for Trekking</span>
            </div>
          )}
          {profile?.status === 'IN_REVIEW' && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]"></span>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Status: In Medical Review</span>
            </div>
          )}
          {profile?.status === 'AWAITING_CLEARANCE' && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]"></span>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Medical Review: IN PROCESS</span>
            </div>
          )}
          {(!profile?.status || profile?.status === 'NONE') && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
              <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Medical Info Recorded</span>
            </div>
          )}
        </div>
      </div>

      {/* Vital Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Height', val: profile?.vitals?.height, unit: 'cm', color: 'blue', icon: 'M7 16V4m0 12l-3-3m3 3l3-3M17 8v12m0-12l-3 3m3-3l3 3' },
          { label: 'Weight', val: profile?.vitals?.weight, unit: 'kg', color: 'emerald', icon: 'M3 6l3 12h12l3-12H3z' },
          { label: 'Blood Group', val: profile?.vitals?.bloodGroup, unit: '', color: 'rose', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
          { label: 'Blood Pressure', val: profile?.vitals?.bp, unit: '', color: 'amber', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-border p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{stat.label}</span>
                <div className={`w-10 h-10 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-sm`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon}/></svg>
                </div>
              </div>
              <p className="text-3xl font-black text-foreground tracking-tighter">
                {stat.val || '--'} 
                {stat.unit && <span className="text-xs text-muted font-bold uppercase ml-1.5">{stat.unit}</span>}
              </p>
              <p className="text-[11px] text-muted font-bold mt-2 uppercase tracking-tight">{stat.label} Telemetry</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Section */}
        <form onSubmit={handleUpdate} className="lg:col-span-2 space-y-10">
          <div className="bg-white border border-border rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="bg-slate-50/50 px-8 py-6 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                Update Your Health Info
              </h3>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Secure Sync Enabled</span>
            </div>
            
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Height (cm)</label>
                <input 
                  name="height" 
                  defaultValue={profile?.vitals?.height} 
                  type="number" 
                  placeholder="e.g. 175"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Weight (kg)</label>
                <input 
                  name="weight" 
                  defaultValue={profile?.vitals?.weight} 
                  type="number" 
                  placeholder="e.g. 70"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Blood Group</label>
                <select 
                  name="bloodGroup" 
                  defaultValue={profile?.vitals?.bloodGroup}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Select...</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Avg Blood Pressure</label>
                <input 
                  name="bp" 
                  defaultValue={profile?.vitals?.bp} 
                  placeholder="e.g. 120/80"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-8 pt-0 space-y-8">
              <div className="border-t border-slate-100 pt-8">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-5 pl-1">Health Conditions Check</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'heart', label: 'Cardiovascular Condition' },
                    { id: 'asthma', label: 'Respiratory / Asthma' },
                    { id: 'hypertension', label: 'High Blood Pressure' },
                    { id: 'diabetes', label: 'Diabetes' },
                  ].map(item => (
                    <label key={item.id} className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl cursor-pointer hover:border-primary/20 transition-all group">
                      <input 
                        type="checkbox" 
                        name={item.id} 
                        defaultChecked={(profile?.history?.[item.id as keyof typeof profile.history] as boolean) || false}
                        className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20 transition-all"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{item.label}</span>
                    </label>
                  ))}
                  <label className="col-span-full flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl cursor-pointer hover:border-primary/20 transition-all group">
                    <input 
                      type="checkbox" 
                      name="other" 
                      checked={showOther}
                      onChange={(e) => setShowOther(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20 transition-all"
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">Other Medical Conditions / Notes</span>
                  </label>
                </div>
              </div>

              {showOther && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-400">
                  <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest pl-1">Specific Medical Details (Mandatory)</label>
                  <textarea 
                    name="otherDetails" 
                    required={showOther}
                    defaultValue={profile?.history?.other}
                    placeholder="Provide details about surgeries, chronic conditions, or specific alerts..."
                    rows={4}
                    className="w-full bg-white border border-rose-100 rounded-[1.5rem] px-6 py-5 text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all resize-none shadow-sm"
                  />
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-4.5 rounded-[1.25rem] font-bold text-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 h-16 group active:scale-[0.99]"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Save & Continue</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
              
              {/* Modal will handle success flow */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-bold text-rose-600 uppercase tracking-widest text-center">
                   🚨 Critical System Error: {error}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Security & Privacy</h4>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">You are entering high-risk environments. Your health data is the primary bridge between you and our **GTM Medical Team**.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px]">1</div>
                    <span className="text-xs text-white/80">Every data point is strictly private.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px]">2</div>
                    <span className="text-xs text-white/80">Real-time alerts for leaders.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px]">3</div>
                    <span className="text-xs text-white/80">Altitude-safe medical strategy.</span>
                  </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl">
             <h4 className="font-bold text-foreground mb-4">Medical Support</h4>
             <div className="space-y-4">
               <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                 <p className="text-[10px] uppercase font-bold text-amber-600 mb-1 tracking-widest">Medical Team Note</p>
                 <p className="text-xs text-amber-800 leading-normal font-medium">Any condition flagged here will trigger a complimentary consultation with our **In-House Surgeons** to ensure your safety.</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={() => router.push('/dashboard/bookings')}
        title="All set! Confirmed!"
        message="Our medical team is taking a quick look at your profile. You're now ready to explore your dashboard and get prepared for the climb!"
        buttonText="Go to My Dashboard"
      />
    </div>
  );
}

