'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface FeatureSectionProps {
  title: string;
  description: string;
  highlights: string[];
  visual: ReactNode;
  reversed?: boolean;
}

export function FeatureSection({ title, description, highlights, visual, reversed = false }: FeatureSectionProps) {
  return (
    <section className="relative py-24">
      <div className="absolute bottom-0 left-1/2 h-px w-full max-w-4xl -translate-x-1/2" style={{ background: 'linear-gradient(90deg, transparent, rgba(171,81,197,0.4) 30%, rgba(171,81,197,0.6) 50%, rgba(171,81,197,0.4) 70%, transparent)' }} />
      <div className="container mx-auto px-6">
        <div className={`grid grid-cols-1 items-start gap-12 lg:grid-cols-2 ${reversed ? 'lg:grid-flow-dense' : ''}`}>
          {/* Text Content */}
          <ScrollReveal className={reversed ? 'lg:col-start-2' : ''}>
            <h2 className="mb-4 mx-auto max-w-4xl bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl md:text-5xl">
              {title}
            </h2>
            <p className="mb-6 text-xl text-muted-foreground">{description}</p>

            {/* Highlights */}
            <div className="space-y-3">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#AB51C5]/20">
                    <Check className="h-4 w-4 text-[#AB51C5]" />
                  </div>
                  <span className="text-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Visual */}
          <ScrollReveal delay={120} className={`-mx-6 sm:mx-0 ${reversed ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            <div className="relative">
              <div className="absolute -inset-4 hidden rounded-2xl bg-gradient-to-br from-[#AB51C5]/20 via-[#AB51C5]/10 to-transparent blur-3xl sm:block" />
              <div className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-secondary/80 sm:rounded-2xl sm:border sm:shadow-2xl sm:transition-transform sm:hover:-translate-y-1">
                {visual}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
