import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-3xl font-black text-white">404 - Page Not Found</h2>
      <p className="text-xs text-slate-400">The requested page does not exist or has been moved.</p>
      <Link href="/" className="inline-block bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
        Return Home
      </Link>
    </div>
  );
}
