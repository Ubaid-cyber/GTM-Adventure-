import React from 'react';
import { getBookings } from '@/lib/actions/booking-actions';
import BookingTable from '@/components/admin/bookings/BookingTable';
import { CalendarCheck, Users, Banknote, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/utils/formatters';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const bookings = await getBookings();
  
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === 'CONFIRMED' ? b.totalPrice : 0), 0);
  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pendingRequests = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="p-8 space-y-8">
      {/* 🚀 High-Impact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Bookings Management</h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Reservation Real-Time Data (₹)
          </p>
        </div>
      </div>

      {/* 📊 Strategic Operational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
            <Banknote className="w-32 h-32" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Revenue</p>
          <div className="mt-2 text-2xl font-black text-white">{formatINR(totalRevenue)}</div>
          <div className="mt-1 text-[10px] text-green-500 font-bold uppercase tracking-tight">Verified Transactions</div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
            <CalendarCheck className="w-32 h-32" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Trekkers</p>
          <div className="mt-2 text-2xl font-black text-white">{activeBookings}</div>
          <div className="mt-1 text-[10px] text-blue-500 font-bold uppercase tracking-tight">Confirmed Participants</div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
            <Users className="w-32 h-32" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pending Inquiries</p>
          <div className="mt-2 text-2xl font-black text-white">{pendingRequests}</div>
          <div className="mt-1 text-[10px] text-amber-500 font-bold uppercase tracking-tight">Awaiting Confirmation</div>
        </div>
      </div>

      {/* 🛡️ Operations Table */}
      <BookingTable bookings={bookings} />
    </div>
  );
}
