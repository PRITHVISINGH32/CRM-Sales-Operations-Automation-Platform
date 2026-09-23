'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Ticket, CheckCircle2, Calendar, MapPin, Printer, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

interface BookingDetails {
  id: string;
  bookingReference: string;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  paymentStatus: 'SUCCESS' | 'FAILED';
  qrCodeData: string | null;
  createdAt: string;
  show: {
    startTime: string;
    event: { title: string; type: string };
    venue: { name: string; location: string };
  };
  bookingSeats: Array<{
    price: number;
    showSeat: {
      seat: { rowLabel: string; seatNumber: number };
      category: { name: string };
    };
  }>;
}

export default function TicketPage() {
  const params = useParams();
  const bookingId = params?.id as string;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = async () => {
    if (!bookingId) return;
    setLoading(true);
    const res = await fetchApi(`/bookings/${bookingId}`);
    if (res.success && res.data) {
      setBooking(res.data.booking);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  if (loading) {
    return <div className="py-28 text-center text-slate-400 font-medium animate-pulse">Loading ticket details...</div>;
  }

  if (!booking) {
    return (
      <div className="py-28 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Ticket Not Found</h2>
        <Link href="/" className="text-xs text-emerald-600 font-bold hover:underline">Return to Home</Link>
      </div>
    );
  }

  const seatLabels = booking.bookingSeats
    .map((bs) => `${bs.showSeat.seat.rowLabel}${bs.showSeat.seat.seatNumber}`)
    .join(', ');

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-28 pb-12 px-4 sm:px-6">
      <Link href="/my-bookings" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors font-bold">
        <ArrowLeft className="w-4 h-4" /> Back to My Tickets
      </Link>

      {/* Confirmation Header Banner */}
      <div className="bg-emerald-500 text-white p-6 rounded-3xl text-center space-y-2 shadow-md">
        <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
        <h1 className="text-2xl font-black">Booking Confirmed!</h1>
        <p className="text-xs text-emerald-100 font-medium">Your seats are secured. Confirmation email dispatched via Resend.</p>
      </div>

      {/* Physical Ticket Pass UI */}
      <div className="aero-card-static rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative">
        <div className="bg-slate-900 p-6 text-white space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold tracking-widest bg-emerald-500 text-white px-3 py-1 rounded-full">
              {booking.show.event.type} PASS
            </span>
            <span className="text-xs font-mono font-black bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
              {booking.bookingReference}
            </span>
          </div>
          <h2 className="text-2xl font-black pt-2">{booking.show.event.title}</h2>
        </div>

        <div className="p-6 space-y-6 bg-white">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> Venue</span>
              <div className="font-extrabold text-slate-900">{booking.show.venue.name}</div>
              <div className="text-[10px] text-slate-500">{booking.show.venue.location}</div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500" /> Showtime</span>
              <div className="font-extrabold text-slate-900">
                {new Date(booking.show.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-[10px] text-emerald-600 font-extrabold">
                {new Date(booking.show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1"><Ticket className="w-3 h-3 text-emerald-500" /> Seats</span>
              <div className="font-black text-emerald-600 text-sm">{seatLabels}</div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Paid</span>
              <div className="font-black text-slate-900 text-sm">₹{booking.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* QR Code Container */}
          {booking.qrCodeData && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="inline-block p-3 bg-white rounded-xl shadow-md border border-slate-200">
                <img src={booking.qrCodeData} alt="Ticket QR Code" className="w-44 h-44 mx-auto" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Show this QR code at the venue entry for quick scan check-in.
              </p>
            </div>
          )}

          {/* Email Notification Indicator */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Confirmation sent via <strong>Resend</strong> email delivery.</span>
          </div>
        </div>

        {/* Print Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Ticket Pass
          </button>
        </div>
      </div>
    </div>
  );
}
