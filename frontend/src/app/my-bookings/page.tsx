'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { Ticket, Calendar, MapPin, QrCode, XCircle, Clock } from 'lucide-react';

interface BookingSeatItem {
  showSeat: {
    seat: { rowLabel: string; seatNumber: number };
    category: { name: string };
  };
}

interface BookingItem {
  id: string;
  bookingReference: string;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  show: {
    startTime: string;
    event: { title: string; type: string };
    venue: { name: string; location: string };
  };
  bookingSeats: BookingSeatItem[];
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    const res = await fetchApi<{ bookings: BookingItem[] }>('/bookings/my-bookings');
    if (res.success && res.data) {
      setBookings(res.data.bookings);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Released seats will be automatically offered to the waitlist queue.')) {
      return;
    }

    const res = await fetchApi(`/bookings/${id}/cancel`, { method: 'POST' });
    if (res.success) {
      alert('Booking cancelled successfully. Seats have been returned to available pool / offered to waitlist.');
      loadBookings();
    } else {
      alert(res.error?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-28 pb-12 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Tickets & Bookings</h1>
          <p className="text-xs text-slate-500">Manage your active event tickets and review booking history.</p>
        </div>
        <Link href="/waitlist" className="btn-emerald text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 self-start">
          <Clock className="w-4 h-4" /> View My Waitlists
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-medium animate-pulse">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="aero-card-static rounded-3xl p-12 text-center space-y-4">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-extrabold text-slate-800">No Bookings Found</h3>
          <p className="text-xs text-slate-500">You haven’t booked any event tickets yet.</p>
          <Link href="/" className="inline-block btn-coral text-xs px-5 py-2.5 rounded-xl shadow-sm">
            Browse Events Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const seatsStr = b.bookingSeats
              .map((bs) => `${bs.showSeat.seat.rowLabel}${bs.showSeat.seat.seatNumber}`)
              .join(', ');

            const isConfirmed = b.status === 'CONFIRMED';

            return (
              <div key={b.id} className="aero-card-static p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {b.status}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-slate-500">{b.bookingReference}</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{b.show.event.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.show.venue.name}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(b.show.startTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600"><Ticket className="w-3.5 h-3.5 text-emerald-500" /> Seats: {seatsStr}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right pr-4">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Paid</span>
                    <span className="text-lg font-black text-slate-900">₹{b.totalAmount.toFixed(2)}</span>
                  </div>

                  {isConfirmed && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/booking/${b.id}`}
                        className="btn-emerald text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" /> Ticket Pass
                      </Link>

                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
