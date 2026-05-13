'use client';

import { Shuffle, EyeOff, HelpCircle } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const problems = [
  {
    icon: Shuffle,
    headline: 'Scattered Trades',
    description: 'Your trades are scattered across exchanges',
  },
  {
    icon: EyeOff,
    headline: 'Blind Performance',
    description: "You don't know your real performance",
  },
  {
    icon: HelpCircle,
    headline: 'Guessing Game',
    description: "You're guessing, not improving",
  },
];


export function TrustBar() {
  return (
    <section className="border-b border-border/50 py-16">
      <div className="container mx-auto px-6">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-[#BA7CFF]">
          The Problem
        </p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {problems.map((item) => (
            <div
              key={item.headline}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-secondary to-secondary/50 p-8 text-center transition-transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#BA7CFF]/5 to-transparent" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#BA7CFF]/20">
                  <item.icon className="h-6 w-6 text-[#BA7CFF]" />
                </div>
                <div className="mb-2 text-xl font-bold">{item.headline}</div>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
