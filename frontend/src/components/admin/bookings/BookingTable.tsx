'use client';

import React from 'react';
import { 
  Users, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreHorizontal,
  ChevronRight,
  MapPin,
  Trash2,
  Filter,
  HeartPulse,
  FileText,
  UserCog
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  updateBookingStatus, 
  deleteBooking, 
  updateBookingNotes, 
  updateMedicalClearance, 
  assignStaffToBooking,
  getStaffMembers 
} from '@/lib/actions/booking-actions';
import { formatINR, formatDate } from '@/lib/utils/formatters';

interface BookingTableProps {
  bookings: any[];
}

export default function BookingTable({ bookings }: BookingTableProps) {
  const [mounted, setMounted] = React.useState(false);
  const [showCancelled, setShowCancelled] = React.useState(false);
  const [staffMembers, setStaffMembers] = React.useState<any[]>([]);

  React.useEffect(() => {
    setMounted(true);
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const staff = await getStaffMembers();
      setStaffMembers(staff);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleMedicalToggle = async (id: string, currentStatus: boolean) => {
    try {
      await updateMedicalClearance(id, !currentStatus);
      toast.success(currentStatus ? 'Medical clearance removed' : 'Trekker Cleared for Adventure!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleNotesUpdate = async (id: string, currentNotes: string | null) => {
    const newNotes = window.prompt('Enter Internal Operational Notes:', currentNotes || '');
    if (newNotes !== null) {
      try {
        await updateBookingNotes(id, newNotes);
        toast.success('Notes saved successfully');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleStaffAssign = async (bookingId: string, staffId: string) => {
    try {
      await assignStaffToBooking(bookingId, staffId === 'none' ? null : staffId);
      toast.success(staffId === 'none' ? 'Staff unassigned' : 'Staff assigned successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Kya aap PUKKA is booking ko hamesha ke liye HTANA chahte hain?')) {
      try {
        await deleteBooking(id);
        toast.success('Booking successfully deleted');
      } catch (error: any) {
        toast.error('Galti se delete nahi hua: ' + error.message);
      }
    }
  };

  const filteredBookings = bookings.filter(b => showCancelled || b.status !== 'CANCELLED');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          Trekker Inventory
        </h3>
        <button 
          onClick={() => setShowCancelled(!showCancelled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${showCancelled ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'}`}
        >
          <Filter className="w-3 h-3" />
          {showCancelled ? 'Show All' : 'Hide Cancelled'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Customer</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Trek Details</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Pricing (₹)</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking, index) => (
              <motion.tr 
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-white/[0.03] transition-colors"
              >
                {/* 🛡️ Customer Profile */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black">
                        {booking.user?.name?.charAt(0) || 'U'}
                      </div>
                      {booking.medicalCleared && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center" title="Medical Cleared">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase tracking-tight italic">
                        {booking.user?.name || 'Unknown Trekker'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30 font-medium lowercase">
                          {booking.user?.email || 'No Email Record'}
                        </span>
                        {booking.internalNotes && (
                          <div className="flex items-center gap-1 text-amber-500/50" title={booking.internalNotes}>
                            <FileText className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 🏔️ Trek Details & Staff */}
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-tight">{booking.trek?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCog className="w-3 h-3 text-white/20" />
                      <select 
                        className="bg-transparent border-none text-[10px] text-white/40 focus:ring-0 cursor-pointer hover:text-blue-400 transition-colors uppercase font-bold tracking-widest p-0"
                        value={booking.assignedStaffId || 'none'}
                        onChange={(e) => handleStaffAssign(booking.id, e.target.value)}
                      >
                        <option value="none" className="bg-slate-900">No Staff Assigned</option>
                        {staffMembers.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-900">
                            {s.name}({s.role === 'LEADER' ? 'Trek Leader' : 'Admin'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>

                {/* 📊 Pricing & Group Size */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white">{mounted ? formatINR(booking.totalPrice) : '₹--'}</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                      Group of {booking.participants}
                    </span>
                  </div>
                </td>

                {/* 🚦 Status Badge */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.1em]
                      ${getStatusStyle(booking.status)}
                    `}>
                      {booking.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                      {booking.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {booking.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                      {booking.status}
                    </div>
                    <button 
                      onClick={() => handleMedicalToggle(booking.id, booking.medicalCleared)}
                      className={`p-1.5 rounded-lg border transition-all ${booking.medicalCleared ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/20 hover:text-emerald-500'}`}
                      title={booking.medicalCleared ? "Medical Cleared" : "Mark as Medical Cleared"}
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleNotesUpdate(booking.id, booking.internalNotes)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/20 hover:text-amber-500 hover:border-amber-500/30 transition-all"
                      title="Internal Notes"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                {/* ⚙️ Actions */}
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {booking.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/30 transition-all border border-emerald-500/20"
                        title="Mark as Paid"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-600/20 text-white/40 hover:text-rose-500 transition-all border border-white/5"
                      title="Cancel Reservation"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(booking.id)}
                      className="p-2 rounded-lg bg-rose-600/10 hover:bg-rose-600/30 text-rose-500 transition-all border border-rose-500/20"
                      title="Permanent Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
            <Calendar className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-white font-bold uppercase tracking-[0.3em] text-sm">Deployment Ready</h3>
          <p className="text-white/30 text-xs mt-3 max-w-xs mx-auto font-medium">No reservations have been logged yet. All upcoming trekkers will be visible here.</p>
        </div>
      )}
    </div>
  );
}
