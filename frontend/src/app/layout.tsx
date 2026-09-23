import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'CinePass Live | Ticket Booking System',
  description: 'Full-stack production ticket booking platform for movies & concerts with real-time seat maps and waitlists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
