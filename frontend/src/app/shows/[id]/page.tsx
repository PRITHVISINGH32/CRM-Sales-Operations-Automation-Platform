'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/lib/auth';
import { Ticket, Clock, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Sparkles, UserCheck } from 'lucide-react';

interface SeatItem {
  id: string;
  seatId: string;
  rowLabel: string;
  seatNumber: number;
  position: number;
  categoryId: string;
  categoryName: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED';
}

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  isSoldOut: boolean;
}

interface ShowDetails {
  id: string;
  startTime: string;
  event: { title: string; type: string; posterUrl: string | null };
  venue: { name: string; location: string };
  categoryPrices: Array<{ categoryId: string; price: number; category: { name: string } }>;
}

export default function SeatMapPage() {
  const params = useParams();
  const router = useRouter();
  const showId = params?.id as string;
  const { user } = useAuth();

  const [show, setShow] = useState<ShowDetails | null>(null);
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [waitlistModalCategory, setWaitlistModalCategory] = useState<CategoryStat | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  const loadSeats = async () => {
    if (!showId) return;
    setLoading(true);
    const res = await fetchApi(`/shows/${showId}/seats`);
    if (res.success && res.data) {
      setShow(res.data.show);
      setSeats(res.data.seats);
      setCategoryStats(res.data.categoryStats);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSeats();

    if (!showId) return;
    const socket = getSocket();

    socket.emit('join:show', showId);

    const handleSeatUpdate = (payload: { showId: string; seatId: string; status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'OFFERED' }) => {
      if (payload.showId !== showId) return;

      setSeats((prevSeats) =>
        prevSeats.map((s) => {
          if (s.id === payload.seatId) {
            return {
              ...s,
              status: payload.status === 'OFFERED' ? 'HELD' : payload.status,
            };
          }
          return s;
        })
      );
    };

    socket.on('seat:updated', handleSeatUpdate);
    socket.on('seat:held', handleSeatUpdate);
    socket.on('seat:released', handleSeatUpdate);
    socket.on('seat:booked', handleSeatUpdate);
    socket.on('seat:offered', handleSeatUpdate);

    return () => {
      socket.emit('leave:show', showId);
      socket.off('seat:updated', handleSeatUpdate);
      socket.off('seat:held', handleSeatUpdate);
      socket.off('seat:released', handleSeatUpdate);
      socket.off('seat:booked', handleSeatUpdate);
      socket.off('seat:offered', handleSeatUpdate);
    };
  }, [showId]);

  const toggleSeatSelection = (seat: SeatItem) => {
    if (seat.status !== 'AVAILABLE') return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const handleHoldSeats = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (selectedSeatIds.length === 0) return;

    setHolding(true);
    setErrorMessage(null);

    const res = await fetchApi(`/shows/${showId}/holds`, {
      method: 'POST',
      body: JSON.stringify({ seatIds: selectedSeatIds }),
    });

    setHolding(false);

    if (res.success && res.data) {
      sessionStorage.setItem('activeHoldToken', res.data.holdToken);
      sessionStorage.setItem('activeHoldData', JSON.stringify(res.data));
      router.push('/checkout');
    } else {
      setErrorMessage(res.error?.message || 'Failed to hold selected seats');
      loadSeats();
      setSelectedSeatIds([]);
    }
  };

  const handleJoinWaitlist = async (categoryId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setJoiningWaitlist(true);
    const res = await fetchApi(`/shows/${showId}/waitlist`, {
      method: 'POST',
      body: JSON.stringify({ categoryId }),
    });
    setJoiningWaitlist(false);

    if (res.success) {
      alert(`🎉 Success! You have joined the waitlist for this category. We will send an email offer if a seat becomes available.`);
      setWaitlistModalCategory(null);
    } else {
      alert(res.error?.message || 'Failed to join waitlist');
    }
  };

  const rowsMap: Record<string, SeatItem[]> = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.rowLabel]) rowsMap[seat.rowLabel] = [];
    rowsMap[seat.rowLabel].push(seat);
  });

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeatsList.reduce((sum, s) => {
    const cp = show?.categoryPrices.find((p) => p.categoryId === s.categoryId);
    return sum + (cp ? cp.price : 0);
  }, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pt-28 pb-24 px-4 sm:px-6">
      {/* Header Info */}
      {show && (
        <div className="aero-card-static p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Live Seat Map
            </div>
            <h1 className="text-2xl font-black text-slate-900">{show.event.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {show.venue.name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(show.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

          {/* Pricing Legend */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            {categoryStats.map((stat) => (
              <div key={stat.categoryId} className="text-center px-3 border-r last:border-0 border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{stat.categoryName}</span>
                <span className="text-emerald-600 font-black">₹{stat.price}</span>
                {stat.isSoldOut && (
                  <button
                    onClick={() => setWaitlistModalCategory(stat)}
                    className="block text-[9px] text-[#FF5722] underline font-extrabold mt-0.5 hover:text-red-700"
                  >
                    Sold Out (Join Waitlist)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Visual Seat Map Container */}
      <div className="aero-card-static p-8 rounded-3xl text-center space-y-10 shadow-lg relative overflow-hidden border border-slate-200">
        {/* Screen Header */}
        <div className="max-w-md mx-auto py-2 px-8 bg-slate-900 text-white rounded-xl text-xs font-black tracking-widest uppercase shadow-sm">
          STAGE / SCREEN THIS WAY
        </div>

        {/* Seat Matrix Grid */}
        {loading ? (
          <div className="py-20 text-slate-400 text-sm font-medium animate-pulse">Loading seating layout...</div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto overflow-x-auto pb-4">
            {Object.keys(rowsMap).sort().map((rowLabel) => (
              <div key={rowLabel} className="flex items-center justify-center gap-3 min-w-max">
                <span className="w-6 text-xs font-bold text-slate-400">{rowLabel}</span>
                <div className="flex gap-2">
                  {rowsMap[rowLabel].map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    let buttonClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-[#10B981] hover:text-white hover:scale-110 shadow-xs';

                    if (seat.status === 'BOOKED') {
                      buttonClass = 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60';
                    } else if (seat.status === 'HELD') {
                      buttonClass = 'bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed opacity-80';
                    } else if (isSelected) {
                      buttonClass = 'bg-[#10B981] border-emerald-500 text-white shadow-md scale-110 ring-2 ring-emerald-400';
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={seat.status !== 'AVAILABLE'}
                        onClick={() => toggleSeatSelection(seat)}
                        title={`${seat.rowLabel}${seat.seatNumber} (${seat.categoryName}) - Status: ${seat.status}`}
                        className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-center ${buttonClass}`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
                <span className="w-6 text-xs font-bold text-slate-400">{rowLabel}</span>
              </div>
            ))}
          </div>
        )}

        {/* Legend Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-emerald-100 border border-emerald-300" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-[#10B981] border border-emerald-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-amber-100 border border-amber-300" />
            <span>Held by Others</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-slate-200 border border-slate-300" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Floating Action Bar when seats are selected */}
      {selectedSeatIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 animate-slideUp">
          <div className="bg-slate-900 text-white border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-300">
                Selected: <span className="text-emerald-400 font-extrabold">{selectedSeatsList.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ')}</span>
              </div>
              <div className="text-lg font-black text-white">
                Total Amount: <span className="text-emerald-400">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleHoldSeats}
              disabled={holding}
              className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2 text-xs font-bold transition-all"
            >
              {holding ? 'Securing Hold...' : 'Hold & Checkout'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {waitlistModalCategory && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Join Category Waitlist
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The <strong>{waitlistModalCategory.categoryName}</strong> category is currently sold out. By joining the waitlist, you will be automatically offered the next available seat on a FIFO basis if another customer cancels.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-200">
              <div className="text-slate-600">Category: <span className="text-slate-900 font-bold">{waitlistModalCategory.categoryName}</span></div>
              <div className="text-slate-600">Price: <span className="text-emerald-600 font-bold">₹{waitlistModalCategory.price}</span></div>
              <div className="text-slate-600">Offer Expiry Window: <span className="text-amber-600 font-bold">10 Minutes</span></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setWaitlistModalCategory(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinWaitlist(waitlistModalCategory.categoryId)}
                disabled={joiningWaitlist}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                {joiningWaitlist ? 'Joining...' : 'Confirm Join Waitlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
