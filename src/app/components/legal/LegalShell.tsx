import type { ReactNode } from 'react';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

// Page chrome shared by /privacy, /terms and /support: the same navbar and
// footer as the home page, with a reading-width column in between.
export function LegalShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <Navbar />
      <main className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(120,60,200,0.18) 0%, rgba(60,25,120,0.06) 45%, transparent 75%)',
          }}
        />
        <div className={`container relative mx-auto px-6 pb-24 pt-28 sm:pt-32 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
