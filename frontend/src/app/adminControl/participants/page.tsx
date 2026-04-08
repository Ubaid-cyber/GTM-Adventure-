import React from 'react';
import { getAdminUsers, updateUserRole } from '@/lib/actions/admin-actions';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  MapPin, 
  Shield, 
  UserCheck, 
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';

export default async function CustomersPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 🏔️ Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Customers</h1>
          <p className="text-white/40 text-sm mt-1">Unified directory for trekker engagement and role management.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl px-4 py-2">
           <Users className="w-4 h-4 text-blue-500" />
           <span className="text-white text-sm font-bold">{users.length} Total Registered</span>
        </div>
      </div>

      {/* 📊 Strategic User Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Active Trekkers</div>
           <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'TREKKER').length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl border-blue-500/10">
           <div className="text-[10px] font-black uppercase tracking-widest text-blue-500/50 mb-1">Trek Leaders & Guides</div>
           <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'LEADER').length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total Bookings</div>
           <div className="text-2xl font-bold text-white">{users.reduce((acc, u) => acc + u._count.bookings, 0)}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl border-green-500/10">
           <div className="text-[10px] font-black uppercase tracking-widest text-green-500/50 mb-1">Engagement Rate</div>
           <div className="text-2xl font-bold text-white">74.2%</div>
        </div>
      </div>

      {/* 📋 Customer Directory Table */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/[0.01]">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
             <input 
               type="text" 
               placeholder="Search by Name, Email, or Country..." 
               className="w-full bg-transparent border-none text-xs text-white placeholder:text-white/20 focus:ring-0"
             />
           </div>
           <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 rounded-lg text-[11px] font-bold transition-all">
             <Filter className="w-3.5 h-3.5" />
             Filter
           </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Personnel</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Security Role</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Activity</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Joined</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                      <img 
                        src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=2563eb&color=fff`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{user.name || 'Anonymous User'}</div>
                      <div className="flex items-center gap-1.5 text-white/30 text-[11px] mt-0.5">
                        <Mail className="w-3 h-3 opacity-50" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5
                      ${user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        user.role === 'LEADER' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                        'bg-white/5 text-white/40 border-white/10'}
                    `}>
                      {user.role === 'ADMIN' && <Shield className="w-2.5 h-2.5" />}
                      {user.role === 'LEADER' && <UserCheck className="w-2.5 h-2.5" />}
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{user._count.bookings}</span>
                    <span className="text-[10px] text-white/30 uppercase font-black">Confirmed Bookings</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="text-white/60 text-xs">
                     {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <form action={async () => {
                      'use server';
                      const newRole = user.role === 'TREKKER' ? 'LEADER' : 'TREKKER';
                      await updateUserRole(user.id, newRole);
                    }}>
                      <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-md text-[11px] font-bold transition-all border border-white/5">
                        {user.role === 'TREKKER' ? 'Promote to Leader' : 'Switch to Trekker'}
                      </button>
                    </form>
                    <button className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
