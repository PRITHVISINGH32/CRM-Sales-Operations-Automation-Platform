'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Clock, ShieldCheck, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

interface HoldData {
  holdToken: string;
  showId: string;
  expiresAt: string;
  totalAmount: number;
  seats: Array<{
    showSeatId: string;
    seatNumber: number;
    rowLabel: string;
    categoryName: string;
    price: number;
  }>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [holdData, setHoldData] = useState<HoldData | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('activeHoldData');
    if (!raw) {
      router.push('/');
      return;
    }

    try {
      const parsed: HoldData = JSON.parse(raw);
      setHoldData(parsed);

      const expires = new Date(parsed.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setTimeLeftSeconds(diff);
      if (diff === 0) setIsExpired(true);
    } catch (e) {
      router.push('/');
    }
  }, []);

  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      if (holdData) setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, holdData]);

  const handleSimulatePayment = async (result: 'SUCCESS' | 'FAILED') => {
    if (!holdData || isExpired || processing) return;

    setProcessing(true);

    const res = await fetchApi('/payments/simulate', {
      method: 'POST',
      body: JSON.stringify({
        holdToken: holdData.holdToken,
        result,
      }),
    });

    setProcessing(false);

    if (res.success && res.data) {
      sessionStorage.removeItem('activeHoldData');
      sessionStorage.removeItem('activeHoldToken');

      if (result === 'SUCCESS' && res.data.bookingId) {
        router.push(`/booking/${res.data.bookingId}`);
      } else {
        alert('Payment Simulation Failed. Your seat hold has been released.');
        router.push(holdData.showId ? `/shows/${holdData.showId}` : '/');
      }
    } else {
      alert(res.error?.message || 'Payment simulation failed');
      sessionStorage.removeItem('activeHoldData');
      sessionStorage.removeItem('activeHoldToken');
      router.push(holdData.showId ? `/shows/${holdData.showId}` : '/');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!holdData) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-28 pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
          <ShieldCheck className="w-4 h-4" /> Secure Aero Checkout
        </div>
        <h1 className="text-3xl font-black text-slate-900">Complete Your Booking</h1>
        <p className="text-xs text-slate-500">Review your order details and execute simulated payment.</p>
      </div>

      {/* Hold Expiration Timer Banner */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between shadow-sm transition-all ${
        isExpired
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 flex-shrink-0 animate-pulse text-amber-600" />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider">
              {isExpired ? 'Hold Expired' : 'Temporary Seat Hold Active'}
            </div>
            <div className="text-[11px] text-slate-600">
              {isExpired ? 'Your 10-minute hold has expired. Seats returned to available pool.' : 'Backend holds seats during checkout. Complete payment before timer expires.'}
            </div>
          </div>
        </div>

        <div className="text-2xl font-black font-mono tracking-widest bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs text-slate-900">
          {formatTimer(timeLeftSeconds)}
        </div>
      </div>

      {/* Booking Summary Card */}
      <div className="aero-card-static p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>

        <div className="space-y-3 text-xs">
          <div className="text-slate-500 font-bold uppercase tracking-wider">Seats Selected:</div>
          <div className="grid grid-cols-2 gap-3">
            {holdData.seats.map((seat) => (
              <div key={seat.showSeatId} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-slate-900">Seat {seat.rowLabel}{seat.seatNumber}</div>
                  <div className="text-[10px] text-slate-500">{seat.categoryName}</div>
                </div>
                <div className="font-extrabold text-emerald-600">₹{seat.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-black">
            <span className="text-slate-700">Total Payable Amount:</span>
            <span className="text-2xl text-emerald-600 font-black">₹{holdData.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Simulated Payment Gateway Section */}
      <div className="aero-card-static p-6 rounded-3xl space-y-6 shadow-md border-emerald-200">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
          <CreditCard className="w-5 h-5" /> Payment Simulation Mode
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          No real payment gateway is integrated per requirements. Use the action buttons below to test server-side transactional booking conversion or payment failure seat release.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            disabled={isExpired || processing}
            onClick={() => handleSimulatePayment('SUCCESS')}
            className="btn-emerald py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle2 className="w-5 h-5" />
            {processing ? 'Processing...' : 'Simulate Success'}
          </button>

          <button
            disabled={isExpired || processing}
            onClick={() => handleSimulatePayment('FAILED')}
            className="btn-coral py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <XCircle className="w-5 h-5" />
            {processing ? 'Processing...' : 'Simulate Failure'}
          </button>
        </div>
      </div>
    </div>
  );
}
