import React from 'react';
import { 
  TrendingUp, 
  Map, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Target,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Briefcase,
  Zap
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAdminFinancialStats } from '@/lib/actions/admin-actions';
import { StatCard } from './components/StatCard';
import { formatINR } from '@/lib/utils/formatters';

export default async function AdminDashboardPage() {
  // 📊 Professional Business Data Fetching
  const [
    totalRevenue,
    activeTreks,
    pendingApprovals,
    totalCustomers,
    recentBookings,
    finStats
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
    }),
    getAdminFinancialStats()
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 text-left">
      {/* 💼 Business Identification */}
      <div className="flex items-end justify-between">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-white">Business Overview</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Administrative Management & Fiscal Audit</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
          <div className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg">Operational</div>
          <span className="text-white/40 text-[10px] font-bold pr-4 italic">Last Update: Just now</span>
        </div>
      </div>

      {/* 📋 Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          name="Total Revenue" 
          value={formatINR(totalRevenue._sum.totalPrice || 0)} 
          icon={CreditCard} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
          growth={`${finStats.growth}%`}
          growthColor={finStats.growth >= 0 ? 'text-green-500' : 'text-rose-500'}
        />
        <StatCard 
          name="Active Treks" 
          value={activeTreks.toString()} 
          icon={Map} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
          growth="Live"
          growthColor="text-blue-500"
        />
        <StatCard 
          name="Health Approvals" 
          value={pendingApprovals.toString()} 
          icon={Activity} 
          color="text-amber-500" 
          bg="bg-amber-500/10" 
          growth="Action"
          growthColor="text-amber-500"
        />
        <StatCard 
          name="Customer Directory" 
          value={totalCustomers.toString()} 
          icon={Users} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
          growth="Verified"
          growthColor="text-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🏔️ Recent Activity & Transactions */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/20">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Recent Transactions</h2>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-white border border-blue-500/20 px-4 py-2 rounded-lg transition-all">Full Accounting Ledger</button>
          </div>

          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                      <img 
                        src={booking.user.profileImage || `https://ui-avatars.com/api/?name=${booking.user.name}&background=2563eb&color=fff`} 
                        alt="User" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm tracking-tight">{booking.user.name}</p>
                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">{booking.trek.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">{formatINR(booking.totalPrice)}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'text-green-500' : 'text-amber-500'}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🛡️ Operations Warning Monitor */}
        <div className="bg-blue-600/5 border border-blue-600/10 rounded-[32px] p-8 space-y-8 shadow-2xl">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-600/30">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Status Monitor</h2>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Health Clearances Needed</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-medium text-left">
                  {pendingApprovals} bookings are awaiting medical review before trek deployment.
                </p>
                <button className="w-full py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all">Review Queue</button>
              </div>

              <div className="p-6 rounded-2xl bg-black/20 border border-white/5 space-y-3 opacity-50">
                <div className="flex items-center gap-2 text-blue-500/50">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Infrastructure Status</span>
                </div>
                <p className="text-xs text-white/30 leading-relaxed font-medium text-left">
                  All systems reporting 100% stable uptime for international tracking modules.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
