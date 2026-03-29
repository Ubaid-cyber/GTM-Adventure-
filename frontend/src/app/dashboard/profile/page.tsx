'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Globe, FileText, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm"
        >
          {/* Header/Cover Area */}
          <div className="h-48 bg-[#1e3a8a] relative">
            <div className="absolute -bottom-16 left-10">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg">
                {user.image ? (
                  <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1e3a8a]/10 text-[#1e3a8a] text-4xl font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 pb-10 px-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-[#1e3a8a]" />
                  {(user as any).role || 'Standard Member'} • Verified Personnel
                </p>
              </div>
              <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">
                Edit Registry
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Official Contact</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                        <Globe className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Location Unset</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Expedition Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-[#1e3a8a]">0</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-emerald-500">0</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bio / Activity */}
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[160px]">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Personnel Bio</h3>
                  <p className="text-sm text-slate-500 italic leading-relaxed">
                    No registry data available yet. Use the edit button to update your professional adventurer profile.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Metadata</h3>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-tight">Active Since: March 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
