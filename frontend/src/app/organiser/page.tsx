'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Calendar, Plus, MapPin, Film, Clock, Sparkles } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  type: string;
}

interface VenueItem {
  id: string;
  name: string;
  location: string;
}

interface ShowItem {
  id: string;
  startTime: string;
  endTime: string;
  event: { title: string; type: string };
  venue: { name: string; location: string };
  categoryPrices: Array<{ price: number; category: { name: string } }>;
}

export default function OrganiserDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [shows, setShows] = useState<ShowItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventId, setEventId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [eventsRes, venuesRes, showsRes] = await Promise.all([
      fetchApi<EventItem[]>('/events'),
      fetchApi<VenueItem[]>('/venues'),
      fetchApi<ShowItem[]>('/shows'),
    ]);

    if (eventsRes.success && eventsRes.data) setEvents(eventsRes.data);
    if (venuesRes.success && venuesRes.data) setVenues(venuesRes.data);
    if (showsRes.success && showsRes.data) setShows(showsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !venueId || !startTime || !endTime) {
      alert('Please fill out all fields');
      return;
    }

    setSubmitting(true);
    const res = await fetchApi('/shows', {
      method: 'POST',
      body: JSON.stringify({
        eventId,
        venueId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        categoryPrices: [
          { categoryName: 'VIP Recliner / Premium', price: 1200 },
          { categoryName: 'Standard Executive', price: 600 },
        ],
      }),
    });
    setSubmitting(false);

    if (res.success) {
      alert('Show created successfully!');
      loadData();
    } else {
      alert(res.error?.message || 'Failed to create show');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Organiser Portal
          </div>
          <h1 className="text-3xl font-black text-slate-900">Event & Show Scheduler</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Show Form */}
        <div className="aero-card-static p-6 rounded-3xl space-y-4 border border-slate-200 h-fit">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" /> Schedule New Show
          </h3>

          <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Select Event</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Event --</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.title} ({e.type})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Select Venue</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Venue --</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} - {v.location}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-emerald py-3 rounded-xl font-bold shadow-sm"
            >
              {submitting ? 'Creating Show...' : 'Schedule Show & Seat Inventory'}
            </button>
          </form>
        </div>

        {/* Existing Shows List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">Active Scheduled Shows ({shows.length})</h3>

          {loading ? (
            <div className="py-12 text-slate-400 text-xs font-medium animate-pulse">Loading shows...</div>
          ) : (
            <div className="space-y-3">
              {shows.map((s) => (
                <div key={s.id} className="aero-card-static p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200">
                  <div className="space-y-1 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white">
                      {s.event.type}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">{s.event.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.venue.name}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(s.startTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Category Prices</span>
                    <div className="text-xs font-black text-emerald-600">
                      {s.categoryPrices.map((cp) => `₹${cp.price}`).join(' / ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
