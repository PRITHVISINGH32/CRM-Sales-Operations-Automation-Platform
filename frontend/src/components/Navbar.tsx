'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Ticket, LogOut, ShieldAlert, Sparkles, Compass, Film, Music } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, loginAsRole, logout } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Ticket className="w-6 h-6 -rotate-12" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              CinePass<span className="text-emerald-400 font-black">Aero</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-300 -mt-1">
              Travel & Event Ticketing
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 text-xs font-bold text-slate-200">
          <Link href="/" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 shadow-sm transition-all">
            <Compass className="w-4 h-4 text-emerald-600" />
            Explore
          </Link>
          <Link href="/?type=MOVIE" className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-white/20 hover:text-white transition-all">
            <Film className="w-4 h-4 text-slate-300" />
            Movies
          </Link>
          <Link href="/?type=CONCERT" className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-white/20 hover:text-white transition-all">
            <Music className="w-4 h-4 text-slate-300" />
            Concerts
          </Link>
        </nav>

        {/* Right Section & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-slate-300 font-semibold">Demo Role:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => loginAsRole('CUSTOMER')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  user?.role === 'CUSTOMER'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/20'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => loginAsRole('ORGANISER')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  user?.role === 'ORGANISER'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/20'
                }`}
              >
                Organiser
              </button>
              <button
                onClick={() => loginAsRole('ADMIN')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  user?.role === 'ADMIN'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/20'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* User Account Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'CUSTOMER' && (
                <Link
                  href="/my-bookings"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  My Tickets
                </Link>
              )}
              {user.role === 'ORGANISER' && (
                <Link
                  href="/organiser"
                  className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all"
                >
                  Organiser Dashboard
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  Admin Console
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                <div className="w-9 h-9 rounded-xl bg-white text-slate-900 flex items-center justify-center text-xs font-black shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-white hover:text-amber-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
