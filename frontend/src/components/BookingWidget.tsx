'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface BookingWidgetProps {
  trekId: string;
  price: number;
  availableSpots: number;
}

export default function BookingWidget({ trekId, price, availableSpots }: BookingWidgetProps) {
  const [participants, setParticipants] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass the user email so the backend can identify the user
      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trekId, participants, userEmail: session?.user?.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      setSuccess(true);
      setTimeout(() => router.refresh(), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-1">Booking Confirmed!</h3>
        <p className="text-green-600 text-sm">Your spot has been reserved successfully.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-sm font-semibold text-green-700 hover:text-green-800">Book another?</button>
      </div>
    );
  }

  const isSoldOut = availableSpots <= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-4xl font-black text-green-600">${price}</div>
          <div className="text-sm text-gray-500 font-medium">per person</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${isSoldOut ? 'text-red-500' : 'text-gray-700'}`}>
            {isSoldOut ? 'SOLD OUT' : `${availableSpots} spots left`}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Number of Trekkers</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setParticipants(prev => Math.max(1, prev - 1))} disabled={participants <= 1 || isSoldOut}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors disabled:opacity-30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
            </button>
            <div className="flex-1 h-10 border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-800">{participants}</div>
            <button onClick={() => setParticipants(prev => Math.min(availableSpots, prev + 1))} disabled={participants >= availableSpots || isSoldOut}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors disabled:opacity-30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-sm mb-4 font-medium">
            <span className="text-gray-500">Total Price</span>
            <span className="text-gray-900 font-bold">${price * participants}</span>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">⚠️ {error}</div>}

          <button onClick={handleBooking} disabled={loading || isSoldOut}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all shadow-md hover:shadow-xl active:scale-95 disabled:opacity-50">
            {loading ? 'Processing...' : isSoldOut ? 'Sold Out' : 'Confirm Reservation'}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-4 leading-normal">
        By clicking "Confirm Reservation", you agree to our terms and safety protocols.
      </p>
    </div>
  );
}
