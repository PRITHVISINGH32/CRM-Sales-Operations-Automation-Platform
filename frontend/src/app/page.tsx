'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchApi } from '@/lib/api';
import { Search, Film, Music, Star, Calendar, MapPin, Sparkles, ArrowRight, ShieldCheck, Ticket, ExternalLink, Clock, Flame, Play } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  type: 'MOVIE' | 'CONCERT';
  posterUrl?: string;
  bannerUrl?: string;
  language?: string;
  genre?: string;
  rating?: string;
  shows: Array<{
    id: string;
    startTime: string;
    venue: { name: string; location: string };
    categoryPrices: Array<{ price: number; category: { name: string } }>;
  }>;
}

const HERO_SLIDES = [
  {
    image: '/images/hero-stadium.jpg',
    badge: '• LIVE ATOMIC SEAT INVENTORY PLATFORM',
    goldSubtitle: 'STADIUM CONCERTS & CINEMA',
    headline: 'Book Movies & Live Events Instantly',
    description: 'Experience India\'s first 100% concurrency-protected ticketing system — real-time seat maps, 10-minute hold guarantees, and instant QR passes.',
    primaryCta: 'Explore Live Events',
    secondaryCta: 'View Seat Map Demo',
  },
  {
    image: '/images/hero-pyro.png',
    badge: '• HIGH-DEMAND CONCERT ENGINE',
    goldSubtitle: 'LIVE WORLD TOURS 2026',
    headline: 'Reserve Stadium Seats In Seconds',
    description: 'Zero double-booking risk during flash sales. Automatic waitlist allocation upon cancellations with exclusive claim windows.',
    primaryCta: 'Book Concert Tickets',
    secondaryCta: 'Join Event Waitlist',
  },
];

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  useEffect(() => {
    loadEvents();
  }, [selectedType]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    let endpoint = '/events';
    if (selectedType !== 'ALL') {
      endpoint += `?type=${selectedType}`;
    }

    const res = await fetchApi<any>(endpoint);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.events || []);
      setEvents(Array.isArray(list) ? list : []);
    } else {
      setEvents([]);
    }
    setLoading(false);
  };

  const safeEventsList = Array.isArray(events) ? events : [];

  const filteredEvents = safeEventsList.filter((evt) =>
    (evt.title && evt.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (evt.description && evt.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (evt.genre && evt.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (evt.language && evt.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentSlide = HERO_SLIDES[activeSlideIdx];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Full-Bleed Modern Hero Section with High-Res Background Image & 55% Dark Tint Overlay */}
      <section className="relative min-h-[90vh] flex flex-col justify-between pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden border-b border-slate-800">
        {/* High Resolution Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            key={currentSlide.image}
            src={currentSlide.image}
            alt="Stadium Concert Background"
            fill
            priority
            className="object-cover object-center filter brightness-90 contrast-110 transition-opacity duration-1000 scale-105"
          />
          {/* 55% Dark Navy/Black Semi-Transparent Overlay for Supreme Contrast */}
          <div className="absolute inset-0 bg-[#0B0F19]/60 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-[#0B0F19]/40" />
        </div>

        {/* Hero Central Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full my-auto text-left space-y-8">
          {/* Glowing Soft Gold Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-[#E5C158]/50 text-[#E5C158] text-xs font-black tracking-widest uppercase shadow-lg shadow-[#E5C158]/10">
            <Sparkles className="w-3.5 h-3.5 text-[#E5C158] animate-pulse" />
            {currentSlide.badge}
          </div>

          {/* Headline Stack with Soft Gold & Electric Cyan Accents */}
          <div className="space-y-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#E5C158] via-amber-300 to-[#00F2FE] drop-shadow-sm">
              {currentSlide.goldSubtitle}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-lg max-w-4xl">
              {currentSlide.headline}
            </h1>
          </div>

          {/* Muted Light Gray Body Text (#E2E8F0) */}
          <p className="text-base sm:text-lg text-[#E2E8F0] font-normal leading-relaxed max-w-2xl drop-shadow-sm">
            {currentSlide.description}
          </p>

          {/* Search Bar & Action Buttons */}
          <div className="space-y-6 pt-2">
            {/* Live Search Bar */}
            <div className="relative max-w-2xl">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search movies, concerts, venues, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/95 backdrop-blur-md text-slate-900 font-extrabold pl-12 pr-36 py-4 rounded-2xl border-2 border-[#10B981] shadow-2xl text-sm placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-[#10B981]/30"
                />
                <button
                  onClick={loadEvents}
                  className="absolute right-2.5 bg-[#FF5722] hover:bg-[#E64A19] text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-[#FF5722]/30 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  Search
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#events-grid"
                className="bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-xl shadow-[#10B981]/35 flex items-center gap-2 transition-all hover:scale-105"
              >
                {currentSlide.primaryCta}
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#events-grid"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-extrabold text-xs sm:text-sm px-6 py-4 rounded-2xl border border-white/20 flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-[#00F2FE] fill-[#00F2FE]" />
                {currentSlide.secondaryCta}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Floating Metrics Bar (Inspired by Example 2) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/15 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-[#E5C158]/40 flex items-center justify-center text-[#E5C158]">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-white">50,000+</div>
                <div className="text-[11px] font-semibold text-slate-300">Daily Verified Tickets</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-white">100% Safe</div>
                <div className="text-[11px] font-semibold text-slate-300">Row-Level Concurrency</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-white">10 Minutes</div>
                <div className="text-[11px] font-semibold text-slate-300">Auto Seat Hold Timer</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-coral-500/20 border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-xl font-black text-white">4.9 / 5.0</div>
                <div className="text-[11px] font-semibold text-slate-300">User Rating Across 22 Shows</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Events Explorer Container */}
      <div id="events-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        {/* Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl max-w-max border border-slate-300">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                selectedType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 font-bold'
              }`}
            >
              All Events ({safeEventsList.length})
            </button>

            <button
              onClick={() => setSelectedType('MOVIE')}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                selectedType === 'MOVIE'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 font-bold'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#10B981]" />
              Movies
            </button>

            <button
              onClick={() => setSelectedType('CONCERT')}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                selectedType === 'CONCERT'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 font-bold'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-[#FF5722]" />
              Concerts
            </button>
          </div>

          <div className="text-xs font-extrabold text-slate-600">
            Showing <span className="text-slate-900 font-black">{filteredEvents.length}</span> active events
          </div>
        </div>

        {/* 3. Event Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aero-card-static rounded-3xl p-4 space-y-4 animate-pulse">
                <div className="w-full h-72 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="aero-card-static rounded-3xl p-12 text-center space-y-3">
            <Film className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No events matched your search</h3>
            <p className="text-xs text-slate-500">Try searching for different keywords or select "All Events".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((evt) => {
              const firstShow = evt.shows && evt.shows.length > 0 ? evt.shows[0] : null;
              const minPrice = firstShow?.categoryPrices?.reduce(
                (min, p) => (p.price < min ? p.price : min),
                firstShow?.categoryPrices[0]?.price || 300
              );

              return (
                <div
                  key={evt.id}
                  className="aero-card rounded-3xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Poster Image Container */}
                    <div className="relative w-full h-80 bg-slate-100 overflow-hidden">
                      {evt.posterUrl ? (
                        <Image
                          src={evt.posterUrl}
                          alt={evt.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                          <Film className="w-12 h-12" />
                        </div>
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                          evt.type === 'MOVIE' ? 'bg-indigo-600' : 'bg-[#10B981]'
                        }`}>
                          {evt.type}
                        </span>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-extrabold text-slate-900 flex items-center gap-1 shadow-sm border border-slate-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {evt.rating || '4.9'}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-black text-slate-900 line-clamp-1 group-hover:text-[#10B981] transition-colors">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {evt.description}
                      </p>

                      {firstShow && (
                        <div className="space-y-1.5 text-[11px] text-slate-600 font-semibold pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{firstShow.venue.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{new Date(firstShow.startTime).toLocaleDateString()} at {new Date(firstShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action Card */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Starting From</span>
                      <span className="text-base font-black text-slate-900">₹{minPrice?.toFixed(2)}</span>
                    </div>

                    {firstShow ? (
                      <Link
                        href={`/shows/${firstShow.id}`}
                        className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        Book Seats
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">No Active Shows</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
