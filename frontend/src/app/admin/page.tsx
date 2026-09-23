'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { ShieldCheck, Plus, Building, Sparkles } from 'lucide-react';

export default function AdminConsole() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rows, setRows] = useState(4);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [creating, setCreating] = useState(false);

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      alert('Please fill out venue name and location');
      return;
    }

    setCreating(true);
    const res = await fetchApi('/venues', {
      method: 'POST',
      body: JSON.stringify({
        name,
        location,
        rows,
        seatsPerRow,
      }),
    });
    setCreating(false);

    if (res.success) {
      alert(`🎉 Venue "${name}" with ${rows * seatsPerRow} seats created successfully!`);
      setName('');
      setLocation('');
    } else {
      alert(res.error?.message || 'Failed to create venue');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pt-28 pb-12 px-4 sm:px-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 uppercase">
          <ShieldCheck className="w-4 h-4" /> System Administration
        </div>
        <h1 className="text-3xl font-black text-slate-900">Venue & Seat Layout Builder</h1>
        <p className="text-xs text-slate-500">Create new venues and generate row seat configurations.</p>
      </div>

      <div className="aero-card-static p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 shadow-md">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building className="w-5 h-5 text-emerald-500" /> Venue Creation Form
        </h3>

        <form onSubmit={handleCreateVenue} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Venue Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. INOX Megaplex Arena"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">City / Location Address</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bandra Kurla Complex, Mumbai"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Number of Rows</label>
              <input
                type="number"
                min={1}
                max={10}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Seats per Row</label>
              <input
                type="number"
                min={1}
                max={20}
                value={seatsPerRow}
                onChange={(e) => setSeatsPerRow(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 font-medium">
            Total Physical Seats Generated: <span className="font-black text-emerald-600">{rows * seatsPerRow} Seats</span> across VIP & Standard categories.
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full btn-emerald py-3.5 rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Generating Venue...' : 'Build Venue & Create Seats'}
          </button>
        </form>
      </div>
    </div>
  );
}
