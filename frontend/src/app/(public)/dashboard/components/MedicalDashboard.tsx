'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Search,
  ChevronDown,
  Trash2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { getAllMedicalProfiles, updateMedicalNotesStatus, resetMedicalClearance } from '@/lib/actions/admin-actions';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MedicalProfile {
  id: string;
  status: 'NONE' | 'AWAITING_CLEARANCE' | 'IN_REVIEW' | 'CLEARED';
  vitals: any;
  history: any;
  medicalNotes?: string;
  updatedAt: string;
  user: { name: string; email: string };
}

type FilterStatus = 'ALL' | 'AWAITING_CLEARANCE' | 'IN_REVIEW' | 'CLEARED';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  AWAITING_CLEARANCE: { label: 'Awaiting Review',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-500' },
  IN_REVIEW:          { label: 'In Review',         color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-500'  },
  CLEARED:            { label: 'Cleared',           color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  NONE:               { label: 'Not Submitted',     color: 'text-gray-500',    bg: 'bg-gray-50 border-gray-200',     dot: 'bg-gray-400'  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? (p[p.length - 1][0] ?? '') : '')).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────
export const MedicalDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<MedicalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllMedicalProfiles()
      .then((data) => { if (Array.isArray(data)) setProfiles(data as any); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      const res = await updateMedicalNotesStatus(id, status, notes);
      if (res.success) setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: status as any, medicalNotes: notes } : p));
    } finally { setUpdatingId(null); }
  };

  const dismiss = async (id: string) => {
    if (!confirm('Reset this medical record? The trekker will need to resubmit.')) return;
    setUpdatingId(id);
    try {
      const res = await resetMedicalClearance(id);
      if (res.success) setProfiles(prev => prev.filter(p => p.id !== id));
    } finally { setUpdatingId(null); }
  };

  const filtered = profiles.filter(p => {
    const matchStatus = filter === 'ALL' || p.status === filter;
    const matchSearch = !search || p.user.name.toLowerCase().includes(search.toLowerCase()) || p.user.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Records',      val: profiles.length,                                              icon: Users,         accent: 'text-gray-700', bg: 'bg-white' },
    { label: 'Awaiting Review',    val: profiles.filter(p => p.status === 'AWAITING_CLEARANCE').length, icon: Clock,        accent: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Under Examination',  val: profiles.filter(p => p.status === 'IN_REVIEW').length,          icon: Activity,    accent: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Cleared',            val: profiles.filter(p => p.status === 'CLEARED').length,            icon: CheckCircle2, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Loading records…</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 space-y-8">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Medical Clearance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review, approve, or reset trekker health records before expedition departure.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live · {profiles.length} record{profiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} border border-gray-100 rounded-xl p-5 flex items-center gap-4`}>
            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{s.val}</p>
              <p className="text-[11px] text-gray-500 font-medium mt-1 leading-none">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters + Search ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
          />
        </div>
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'AWAITING_CLEARANCE', 'IN_REVIEW', 'CLEARED'] as FilterStatus[]).map(f => {
            const labels: Record<FilterStatus, string> = { ALL: 'All', AWAITING_CLEARANCE: 'Awaiting', IN_REVIEW: 'In Review', CLEARED: 'Cleared' };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <FileText className="w-8 h-8 opacity-40" />
            <p className="text-sm font-medium">No records match your filter</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Trekker</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Vitals</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(profile => {
                const sc = STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.NONE;
                const isUpdating = updatingId === profile.id;
                const flags = Object.entries(profile.history || {}).filter(([, v]) => v === true).map(([k]) => k);

                return (
                  <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">

                    {/* Trekker */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {initials(profile.user.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{profile.user.name}</p>
                          <p className="text-xs text-gray-400">{profile.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Vitals */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          {profile.vitals?.bp && <span>BP <span className="font-semibold text-gray-900">{profile.vitals.bp}</span></span>}
                          {profile.vitals?.weight && <span>Weight <span className="font-semibold text-gray-900">{profile.vitals.weight} kg</span></span>}
                        </div>
                        {flags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {flags.map(f => (
                              <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-semibold rounded uppercase tracking-wide">
                                <AlertCircle className="w-2.5 h-2.5" />
                                {f === 'hypertension' ? 'High BP' : f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${sc.bg} ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4">
                      <textarea
                        key={profile.id}
                        defaultValue={profile.medicalNotes || ''}
                        onBlur={e => updateStatus(profile.id, profile.status, e.target.value)}
                        placeholder="Add clinical notes…"
                        className="w-full min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none h-14 transition"
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {profile.status !== 'CLEARED' && (
                          <button
                            onClick={() => updateStatus(profile.id, 'CLEARED')}
                            disabled={isUpdating}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-wait whitespace-nowrap shadow-sm"
                          >
                            {isUpdating ? '…' : 'Approve'}
                          </button>
                        )}
                        {profile.status !== 'IN_REVIEW' && profile.status !== 'CLEARED' && (
                          <button
                            onClick={() => updateStatus(profile.id, 'IN_REVIEW')}
                            disabled={isUpdating}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-wait whitespace-nowrap shadow-sm"
                          >
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => dismiss(profile.id)}
                          disabled={isUpdating}
                          title="Reset record"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-lg transition-all disabled:opacity-50 flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Table Footer ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right font-medium">
          Showing {filtered.length} of {profiles.length} records
        </p>
      )}
    </div>
  );
};
