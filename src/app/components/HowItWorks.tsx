'use client';

import { UserPlus, Link2, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollReveal';

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: UserPlus,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: Link2,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: TrendingUp,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
  ];

  return (
    <section className="relative py-24">
      <div className="absolute bottom-0 left-1/2 h-px w-full max-w-4xl -translate-x-1/2" style={{ background: 'linear-gradient(90deg, transparent, rgba(171,81,197,0.4) 30%, rgba(171,81,197,0.6) 50%, rgba(171,81,197,0.4) 70%, transparent)' }} />
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 80} className="relative h-full">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-0.5 w-full origin-left bg-gradient-to-r from-[#BA7CFF]/50 to-transparent md:block" />
              )}

              <div className="relative flex h-full flex-col rounded-2xl border border-border/50 bg-gradient-to-br from-secondary to-secondary/50 p-8 text-center transition-transform hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#BA7CFF] text-sm font-bold">
                  {index + 1}
                </div>

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#BA7CFF]/20">
                  <step.icon className="h-8 w-8 text-[#BA7CFF]" />
                </div>

                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
