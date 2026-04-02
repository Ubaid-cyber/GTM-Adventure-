import React from 'react';
import { getAwaitingClearance, updateMedicalStatus } from '@/lib/actions/admin-actions';
import { 
  ShieldCheck, 
  Activity, 
  User, 
  ChevronRight, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope
} from 'lucide-react';

export default async function MedicalHQPage() {
  const clearanceQueue = await getAwaitingClearance();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 🏥 Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Health Approvals</h1>
          <p className="text-white/40 text-sm mt-1">Reviewing medical vitals and safety clearances for upcoming treks.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-lg">
          <Stethoscope className="w-4 h-4 text-blue-500" />
          <span className="text-blue-500 text-sm font-bold">{clearanceQueue.length} Pending Review</span>
        </div>
      </div>

      {/* 📋 Clearance Queue */}
      <div className="grid grid-cols-1 gap-4">
        {clearanceQueue.map((profile) => (
          <div key={profile.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.03] transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-white/5">
                  <img 
                    src={profile.user.profileImage || `https://ui-avatars.com/api/?name=${profile.user.name}&background=2563eb&color=fff`} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">{profile.user.name}</h3>
                  <p className="text-white/30 text-xs mt-1">{profile.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                  ${profile.status === 'AWAITING_CLEARANCE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}
                `}>
                  {profile.status.replace('_', ' ')}
                </span>
                <button className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 📊 Vitals Snapshot */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-blue-500" />
                  Oxygen Level
                </div>
                <div className="text-lg font-bold text-white">{(profile.vitals as any)?.oxygen || '--'}%</div>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <History className="w-3 h-3 text-blue-500" />
                  Max Altitude
                </div>
                <div className="text-lg font-bold text-white">{(profile.vitals as any)?.altitude || '--'}m</div>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-blue-500" />
                  Condition
                </div>
                <div className="text-lg font-bold text-white">{(profile.history as any)?.condition || 'Healthy'}</div>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  Fitness Scor
                </div>
                <div className="text-lg font-bold text-white">{(profile.fitness as any)?.score || '8.5'}/10</div>
              </div>
            </div>

            {/* 🛠️ Decision Panel */}
            <div className="flex items-center gap-3 pt-6 border-t border-white/5">
              <form action={async () => {
                'use server';
                await updateMedicalStatus(profile.userId, 'CLEARED');
              }}>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-500 border border-green-600/20 rounded-lg text-sm font-bold transition-all">
                  <CheckCircle2 className="w-4 h-4" />
                  Grant Clearance
                </button>
              </form>
              <form action={async () => {
                'use server';
                await updateMedicalStatus(profile.userId, 'IN_REVIEW');
              }}>
                <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/20 rounded-lg text-sm font-bold transition-all">
                  <AlertCircle className="w-4 h-4" />
                  Escalate to Review
                </button>
              </form>
              <div className="flex-1"></div>
              <button className="text-white/20 hover:text-white text-xs font-bold transition-all">View Full Medical Records</button>
            </div>
          </div>
        ))}

        {clearanceQueue.length === 0 && (
          <div className="py-24 text-center space-y-4">
             <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-white/20" />
             </div>
             <h3 className="text-white font-bold text-xl">All Clear</h3>
             <p className="text-white/40 text-sm max-w-sm mx-auto">No pending health clearances found. All trekkers are currently status-compliant.</p>
          </div>
        )}
      </div>
    </div>
  );
}
