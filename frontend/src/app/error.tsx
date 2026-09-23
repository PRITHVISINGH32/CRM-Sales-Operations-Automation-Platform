'use client';

import React from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-3xl font-black text-white">Something Went Wrong</h2>
      <p className="text-xs text-slate-400">{error.message || 'An unexpected error occurred.'}</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
        >
          Try Again
        </button>
        <Link href="/" className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl">
          Return Home
        </Link>
      </div>
    </div>
  );
}
