'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Globe, 
  Mail, 
  Calendar, 
  Activity, 
  Users, 
  Zap, 
  ChevronRight,
  MapPin,
  Mountain,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import { getUserBookingsAction } from '@/lib/actions/booking-actions';

export default function ProfileClient({ 
  initialBookings = [], 
  session 
}: { 
  initialBookings?: any[], 
  session: any 
}) {
  const user = session?.user;
  const role = (user as any)?.role || 'TREKKER';

  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [loadingBookings, setLoadingBookings] = useState(initialBookings.length === 0);

  useEffect(() => {
    if (!user) return;
    // We only fetch if we don't have initial data
    if (initialBookings.length === 0) {
      getUserBookingsAction()
        .then((data) => setBookings(Array.isArray(data) ? data : []))
        .catch(() => setBookings([]))
        .finally(() => setLoadingBookings(false));
    }
  }, [user, initialBookings.length]);

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const totalTreks = confirmedBookings.length;

  if (!user) return null;

  const statusIcon = (status: string) => {
    if (status === 'CONFIRMED') return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
    if (status === 'CANCELLED') return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    return <Clock className="w-3.5 h-3.5 text-amber-400" />;
  };

  const statusColor = (status: string) => {
    if (status === 'CONFIRMED') return 'text-emerald-600 bg-emerald-50';
    if (status === 'CANCELLED') return 'text-rose-500 bg-rose-50';
    return 'text-amber-600 bg-amber-50';
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pt-28 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP LEVEL HUD: Identity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] mb-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-[6px] border-white bg-slate-50 overflow-hidden shadow-2xl ring-1 ring-slate-100">
                {user.image ? (
                  <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-5xl font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Identity */}
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{user.name}</h1>
                <span className="px-5 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  {role}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mb-8">
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                  <Mail className="w-4 h-4 text-primary/40" />
                  <span className="text-xs font-semibold truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                  <Mountain className="w-4 h-4 text-primary/40" />
                  <span className="text-xs font-semibold">{totalTreks} Trek{totalTreks !== 1 ? 's' : ''} Completed</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/dashboard/bookings" className="px-8 py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                  My Bookings
                </Link>
                <Link href="/treks" className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Explore Treks
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROLE-SPECIFIC HUD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* TREKKER SECTION */}
          {role === 'TREKKER' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 space-y-8"
            >
              {/* Health Summary */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-rose-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Health Summary</h3>
                  </div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Monitoring Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Oxygen (SpO2)</div>
                    <div className="text-3xl font-bold text-slate-900 leading-none">98<span className="text-sm font-medium text-slate-400 ml-1">%</span></div>
                    <div className="mt-3 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[98%]"></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Heart Rate</div>
                    <div className="text-3xl font-bold text-slate-900 leading-none">72<span className="text-sm font-medium text-slate-400 ml-1">bpm</span></div>
                    <div className="mt-3 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[70%]"></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Health Status</div>
                    <div className="text-xs font-bold text-emerald-500 uppercase flex items-center justify-center gap-1.5 h-full pt-1">
                      <Shield className="w-3.5 h-3.5" /> Ready
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ADVENTURE HISTORY (LIVE DATA) ── */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    My Adventure History
                  </h3>
                  <div className="text-xs font-bold text-slate-400">
                    Total Treks: {loadingBookings ? '...' : totalTreks}
                  </div>
                </div>

                {loadingBookings ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-[32px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                      <Calendar className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">No Recent Treks Found</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">Your adventure history is currently empty. Secure your first booking to activate profile statistics.</p>
                    <Link href="/treks" className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em] group">
                      Explore Treks <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                            <Mountain className="w-6 h-6 text-primary/60" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-none">{booking.trek?.title || 'Trek'}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {booking.expedition?.startDate && (
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {new Date(booking.expedition.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-medium">
                                {booking.participants} participant{booking.participants !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <p className="font-bold text-slate-900 text-sm">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</p>
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full ${statusColor(booking.status)}`}>
                            {statusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* LEADER SECTION */}
          {role === 'LEADER' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 space-y-8"
            >
              <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Team Overview</h3>
                  </div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-50 rounded-full">Trek Leader Access</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Active Team Members</div>
                    <div className="text-5xl font-black mb-4">0</div>
                    <p className="text-xs text-white/50 leading-relaxed">Assigned trekkers for your upcoming Himalayan journeys will appear here.</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Global Status</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Connection: Optimal</h4>
                    <p className="text-xs text-slate-500 mb-6">Satellite Connection: Stable. Local Command Center Node: Active.</p>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADMIN SECTION — redirect suggestion */}
          {role === 'ADMIN' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 space-y-8"
            >
              <div className="bg-white border border-slate-200 rounded-[40px] p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Archive Access</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                  Administrative operations are managed through the Command Center.
                </p>
                <Link href="/adminControl" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                  <Shield className="w-3 h-3" /> Go to Admin Panel
                </Link>
              </div>
            </motion.div>
          )}

          {/* RIGHT QUADRANT: Common Data Blocks */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
            {/* Account Metadata */}
            <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-8">Registry Metadata</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Bookings</div>
                    <div className="text-sm font-bold text-slate-700">{loadingBookings ? '...' : bookings.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirmed Treks</div>
                    <div className="text-sm font-bold text-slate-700">{loadingBookings ? '...' : totalTreks}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Security Key</div>
                    <div className="text-sm font-bold text-slate-700 truncate max-w-[120px]">E2EE-Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-[40px] p-8">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-6 text-center">Personnel Dossier</h3>
              <p className="text-sm text-slate-600 font-medium italic leading-relaxed text-center">
                &quot;Awaiting professional bio update. Complete your dossier to optimize crew selection and leader pairing.&quot;
              </p>
              <div className="mt-8 pt-8 border-t border-slate-200/50 flex justify-center italic text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                End of Transmission
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
