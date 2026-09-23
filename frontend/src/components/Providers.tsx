'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <div className="relative min-h-screen flex flex-col bg-[#F7F9FC]">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};
