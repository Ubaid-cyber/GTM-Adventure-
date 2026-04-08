import React from 'react';
import { 
  TrendingUp, 
  Map, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Target,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils/formatters';

export default async function AdminDashboardPage() {
  // ... (data fetching remains same)
  const [
    totalRevenue,
    activeExpeditions,
    pendingMedicals,
    totalTrekkers,
    recentBookings
  ] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'CONFIRMED' }
    }),
    prisma.expedition.count({
      where: { status: 'ONGOING' }
    }),
    prisma.medicalProfile.count({
      where: { status: 'AWAITING_CLEARANCE' }
    }),
    prisma.user.count({
      where: { role: 'TREKKER' }
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, trek: true }
    })
  ]);

  const stats = [
    { name: 'Total Revenue', value: formatINR(totalRevenue._sum.totalPrice || 0), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Active Trips', value: activeExpeditions.toString(), icon: Map, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Pending Clearances', value: pendingMedicals.toString(), icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Trekker Registry', value: totalTrekkers.toString(), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* HQ Header Focus */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white">Business Overview</h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Global Operations HQ & Analytics</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
            <div className="px-4 py-2 bg-[#1e3a8a] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Real-time Feed</div>
            <span className="text-white/40 text-[10px] font-bold pr-4">Last Sync: Just now</span>
          </div>
        </div>

        {/* 📋 Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-slate-950/40 backdrop-blur-xl border border-white/5 p-6 rounded-[24px] group hover:border-[#1e3a8a]/40 transition-all hover:-translate-y-1 duration-500">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-125 transition-transform duration-500`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black tracking-widest bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3" />
                  +12%
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.name}</h3>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🏔️ Recent Deployments / Activity */}
          <div className="lg:col-span-2 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1e3a8a]/10 rounded-xl flex items-center justify-center border border-[#1e3a8a]/20">
                  <Target className="w-5 h-5 text-[#1e3a8a]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Recent Financial Operations</h2>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#1e3a8a] border border-[#1e3a8a]/20 px-4 py-2 rounded-lg hover:bg-[#1e3a8a] hover:text-white transition-all">View All Ledger</button>
            </div>

            <div className="space-y-6">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white/40 text-lg font-black border border-white/10">
                      {booking.user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm tracking-tight">{booking.user.name}</p>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{booking.trek.title}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-white font-black text-sm">{formatINR(booking.totalPrice)}</p>
                    <div className={`
                      px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                      ${booking.status === 'CONFIRMED' ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' : 'text-amber-500 bg-amber-500/5 border-amber-500/10'}
                    `}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🚨 HQ Alerts / Safety Monitor */}
          <div className="bg-[#1e3a8a]/10 backdrop-blur-xl border border-[#1e3a8a]/20 rounded-[32px] p-8 space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1e3a8a]/20 rounded-xl flex items-center justify-center border border-[#1e3a8a]/30">
                  <ShieldCheck className="w-5 h-5 text-[#1e3a8a]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Safety HQ Monitor</h2>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#0a0a0a]/60 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Medical Clearance Required</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                    {pendingMedicals} trekkers are awaiting high-altitude medical review before trip departure.
                  </p>
                  <button className="w-full py-3 bg-[#1e3a8a] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1e40af] transition-all shadow-lg shadow-[#1e3a8a]/20">Open Safety Queue</button>
                </div>

                <div className="p-5 rounded-2xl bg-[#0a0a0a]/60 border border-white/5 space-y-3 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Infrastructure Stable</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                    All satellite uplinks and tracking beacon servers are currently reporting 100% operational status.
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
