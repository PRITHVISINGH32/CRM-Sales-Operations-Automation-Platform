'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface WaitlistEntryItem {
  id: string;
  status: 'WAITING' | 'OFFERED' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';
  position: number;
  createdAt: string;
  category: { name: string };
  show: {
    startTime: string;
    event: { title: string };
    venue: { name: string };
  };
  offers: Array<{
    id: string;
    status: 'PENDING' | 'CLAIMED' | 'EXPIRED';
    expiresAt: string;
  }>;
}

export default function WaitlistPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WaitlistEntryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWaitlists = async () => {
    setLoading(true);
    const res = await fetchApi('/waitlist/my-waitlists');
    if (res.success && res.data) {
      setEntries(res.data.waitlistEntries);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadWaitlists();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-28 pb-12 px-4 sm:px-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-7 h-7 text-amber-500" /> My Category Waitlists
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track your FIFO queue positions and time-limited seat offers.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <Clock className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No active waitlists</h3>
          <p className="text-xs text-slate-500">You haven't joined any sold-out event waitlists yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const activeOffer = entry.offers.find((o) => o.status === 'PENDING' && new Date(o.expiresAt) > new Date());

            return (
              <div
                key={entry.id}
                className={`aero-card-static p-6 rounded-3xl border transition-all space-y-4 ${
                  activeOffer
                    ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {entry.category.name} CATEGORY
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        entry.status === 'OFFERED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : entry.status === 'WAITING'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{entry.show.event.title}</h3>
                    <p className="text-xs text-slate-500">{entry.show.venue.name} • {new Date(entry.show.startTime).toLocaleString()}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">FIFO Queue Position</div>
                    <div className="text-2xl font-black text-emerald-600">#{entry.position}</div>
                  </div>
                </div>

                {/* Active Offer Banner */}
                {activeOffer && (
                  <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
                      <div className="text-xs text-amber-900 font-medium">
                        <span className="font-bold">A seat has opened up for you!</span> Offer expires at{' '}
                        {new Date(activeOffer.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                      </div>
                    </div>

                    <Link
                      href="/waitlist/claim"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-amber-500/20 whitespace-nowrap"
                    >
                      Claim Offer Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
