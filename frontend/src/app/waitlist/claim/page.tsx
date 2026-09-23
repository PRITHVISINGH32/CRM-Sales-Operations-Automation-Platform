'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

function ClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [tokenInput, setTokenInput] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams?.get('token');
    if (urlToken) {
      setTokenInput(urlToken);
    }
  }, [searchParams]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    if (!user) {
      alert('Please log in to your account first.');
      router.push('/login');
      return;
    }

    setClaiming(true);
    setErrorMsg(null);

    const res = await fetchApi('/waitlist/claim', {
      method: 'POST',
      body: JSON.stringify({ token: tokenInput.trim() }),
    });

    setClaiming(false);

    if (res.success && res.data) {
      sessionStorage.setItem('activeHoldToken', res.data.holdToken);
      sessionStorage.setItem('activeHoldData', JSON.stringify(res.data));
      router.push('/checkout');
    } else {
      setErrorMsg(res.error?.message || 'Invalid or expired waitlist offer token.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-28 pb-12 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Time-Limited Offer
        </div>
        <h1 className="text-3xl font-black text-slate-900">Claim Waitlist Seat</h1>
        <p className="text-xs text-slate-500">Enter your secure token from your email notification to convert your offer into a checkout hold.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleClaim} className="aero-card-static p-6 rounded-3xl border border-slate-200 space-y-4 shadow-md">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Waitlist Offer Token:</label>
          <input
            type="text"
            required
            placeholder="e.g. 9b1deb4d-3b7d-4b69-9b76-..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono font-bold"
          />
        </div>

        <button
          type="submit"
          disabled={claiming || !tokenInput.trim()}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
        >
          {claiming ? 'Validating Token...' : 'Claim & Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function ClaimWaitlistOfferPage() {
  return (
    <Suspense fallback={<div className="py-28 text-center text-slate-500">Loading offer details...</div>}>
      <ClaimContent />
    </Suspense>
  );
}
