import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Download, 
  Calendar,
  Wallet,
  Receipt,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { getAdminTransactions, getAdminFinancialStats } from '@/lib/actions/admin-actions';
import { StatCard } from '../components/StatCard';

export default async function AccountingPage() {
  const [transactions, finStats] = await Promise.all([
    getAdminTransactions(),
    getAdminFinancialStats()
  ]);
  
  // 💹 Professional Fiscal Analytics
  const totalGross = transactions.filter(t => t.status === 'CONFIRMED').reduce((acc, t) => acc + (t.totalPrice || 0), 0);
  const pendingRevenue = transactions.filter(t => t.status === 'PENDING').reduce((acc, t) => acc + (t.totalPrice || 0), 0);
  const taxEstimate = totalGross * 0.18; // 18% GST Estimate

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 🧾 Page Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight text-white">Accounting</h1>
          <p className="text-white/40 text-sm mt-1">Universal transaction ledger and revenue auditing center.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg text-sm font-bold transition-all">
            <Download className="w-4 h-4" />
            Export Ledger
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 📊 Strategic Financial Overview */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            name="Gross Revenue" 
            value={`$${totalGross.toLocaleString()}`} 
            icon={Wallet} 
            color="text-green-500" 
            bg="bg-green-500/10" 
            growth={`+${finStats.growth}%`}
            description="Total lifetime confirmed revenue."
          />
          <StatCard 
            name="Unconfirmed Bookings" 
            value={`$${pendingRevenue.toLocaleString()}`} 
            icon={Receipt} 
            color="text-amber-500" 
            bg="bg-amber-500/10" 
            growth="Settlement Pending"
            growthColor="text-amber-500"
          />
          <StatCard 
            name="GST Estimate (18%)" 
            value={`$${taxEstimate.toLocaleString()}`} 
            icon={CreditCard} 
            color="text-blue-500" 
            bg="bg-blue-500/10" 
            growth="Fiscal Liability"
            growthColor="text-blue-200"
          />
        </div>

        {/* 🏔️ Trek-wise Revenue breakdown */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4 shadow-2xl relative overflow-hidden group border-blue-500/10">
           <div className="flex items-center gap-3 mb-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Revenue by Trek</h3>
           </div>
           <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {finStats.revenueByTrek.map(rev => (
                <div key={rev.trekId} className="flex items-center justify-between group/trek">
                   <div className="text-left max-w-[140px] truncate">
                      <p className="text-[11px] font-bold text-white/80 group-hover/trek:text-white transition-colors truncate">{rev.title}</p>
                      <div className="w-24 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                         <div 
                           className="h-full bg-blue-500 rounded-full" 
                           style={{ width: `${Math.min(100, (rev.total / (totalGross || 1)) * 100)}%` }} 
                         />
                      </div>
                   </div>
                   <p className="text-[11px] font-black tracking-tight text-white">${rev.total.toLocaleString()}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* 📋 Digital Ledger Table */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/[0.01]">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
             <input 
               type="text" 
               placeholder="Search by User, Booking ID, or Razorpay Reference..." 
               className="w-full bg-transparent border-none text-xs text-white placeholder:text-white/20 focus:ring-0"
             />
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Customer & Trek</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Transaction ID</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((t) => (
              <tr key={t.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-5">
                  <div>
                    <div className="font-bold text-white text-sm">{t.user.name}</div>
                    <div className="text-white/30 text-[11px] mt-0.5">{t.trek.title}</div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="font-mono text-[11px] text-white/40 uppercase tracking-tight">
                    {t.razorpayOrderId || t.id.slice(-12)}
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-white/60 text-xs">
                     <Calendar className="w-3 h-3 opacity-30" />
                     {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                   </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                    ${t.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      t.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'}
                  `}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right font-bold text-white">
                  ${t.totalPrice.toLocaleString()}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-sm font-medium italic">
                  No bookings found in the ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
