'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Ticket, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-28 pb-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md">
          <Ticket className="w-6 h-6 -rotate-12" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">Sign in to manage your tickets and seat holds.</p>
      </div>

      {/* Quick Demo Login Cards */}
      <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl space-y-2 text-xs">
        <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> Quick One-Click Demo Sign-in:
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => { loginAsRole('CUSTOMER'); router.push('/'); }}
            className="bg-white border border-emerald-300 text-slate-900 font-extrabold py-2 px-2 rounded-xl text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-xs"
          >
            Customer
          </button>
          <button
            onClick={() => { loginAsRole('ORGANISER'); router.push('/organiser'); }}
            className="bg-white border border-emerald-300 text-slate-900 font-extrabold py-2 px-2 rounded-xl text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-xs"
          >
            Organiser
          </button>
          <button
            onClick={() => { loginAsRole('ADMIN'); router.push('/admin'); }}
            className="bg-white border border-emerald-300 text-slate-900 font-extrabold py-2 px-2 rounded-xl text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-xs"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="aero-card-static p-6 rounded-3xl space-y-4 border border-slate-200">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-emerald py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-600 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
