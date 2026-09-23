'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Ticket, ShieldCheck, CreditCard, Mail, Heart, CheckCircle, FileText, Lock, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'refund' | 'faq' | null>(null);

  return (
    <footer className="relative bg-slate-900 text-slate-300 pt-16 pb-12 overflow-hidden border-t border-slate-800">
      {/* Background Image 2 (Crowd Hands Graphic) with Dark Aero Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Image
          src="/images/footer-bg.jpg"
          alt="Concert Crowd Audience"
          fill
          className="object-cover object-center filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Ticket className="w-5 h-5 -rotate-12" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                CinePass<span className="text-emerald-400">Aero</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Next-generation travel, movie, and concert event ticketing platform. Experience zero double-booking concurrency guarantees, atomic seat holds, and instant QR pass distribution.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> 100% Verified Seats
              </span>
              <span className="flex items-center gap-1 text-teal-400">
                <CreditCard className="w-4 h-4" /> Instant Refund Engine
              </span>
            </div>
          </div>

          {/* Column 2: Event Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Explore Events</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>
                <Link href="/?type=MOVIE" className="hover:text-emerald-400 transition-colors">
                  Blockbuster Movies
                </Link>
              </li>
              <li>
                <Link href="/?type=CONCERT" className="hover:text-emerald-400 transition-colors">
                  Live Music Concerts
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Cultural Dance & Theatre
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  EDM & Music Festivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Policies & Terms</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>
                <button onClick={() => setActiveModal('terms')} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('privacy')} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('refund')} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Cancellation & Refund
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Ticketing FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Stay Updated</h4>
            <p className="text-xs text-slate-400">Get early access waitlist alerts for upcoming stadium tours.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to event alerts!'); }} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          <div>
            © 2026 CinePass Aero Inc. All rights reserved. Evaluation & Portfolio System.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveModal('terms')} className="hover:text-slate-300">Terms of Use</button>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-300">Privacy Statement</button>
            <button onClick={() => setActiveModal('refund')} className="hover:text-slate-300">Refund Policy</button>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 border border-slate-200">
            {activeModal === 'terms' && (
              <>
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-lg font-black text-slate-900">Terms & Conditions</h3>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                </div>
                <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p><strong>1. Temporary Seat Holds:</strong> Seats are held for a maximum of 10 minutes during checkout. If payment is not completed within 10 minutes, the hold expires automatically.</p>
                  <p><strong>2. Concurrency Policy:</strong> Our system enforces strict row-level transactional locking. Simultaneous attempts to hold the same seat will be awarded on a first-come, first-served basis.</p>
                  <p><strong>3. Ticket Pass:</strong> QR tickets generated upon confirmation are single-use valid entry passes at the venue.</p>
                </div>
              </>
            )}

            {activeModal === 'privacy' && (
              <>
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-lg font-black text-slate-900">Privacy Policy</h3>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                </div>
                <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p><strong>1. Information Collection:</strong> We collect email address and customer name to dispatch QR ticket passes and waitlist notifications.</p>
                  <p><strong>2. Payment Security:</strong> No credit card or CVV details are stored on our servers. Simulated payments execute securely on server-side transactions.</p>
                </div>
              </>
            )}

            {activeModal === 'refund' && (
              <>
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-lg font-black text-slate-900">Cancellation & Refund Policy</h3>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                </div>
                <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p><strong>1. Customer Cancellation:</strong> Confirmed tickets can be cancelled anytime prior to show start from "My Tickets".</p>
                  <p><strong>2. Automated Waitlist Allocation:</strong> Upon cancellation, released seats are automatically offered to the earliest waiting customer on the waitlist with a 10-minute claim token.</p>
                </div>
              </>
            )}

            {activeModal === 'faq' && (
              <>
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-lg font-black text-slate-900">Ticketing FAQs</h3>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                </div>
                <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p><strong>Q: What happens if an event is sold out?</strong><br />A: You can join the category waitlist. If a seat is cancelled, you will receive an exclusive email offer with a 10-minute claim link.</p>
                  <p><strong>Q: How do I show my ticket at the venue?</strong><br />A: Open "My Tickets" or check your confirmation email for the QR code pass.</p>
                </div>
              </>
            )}

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
