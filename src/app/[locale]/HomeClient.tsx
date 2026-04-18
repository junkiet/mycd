'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/app/components/Navbar';
import { Hero } from '@/app/components/Hero';
import { ConstellationOrb } from '@/app/components/ConstellationOrb';
import { FeatureSection } from '@/app/components/FeatureSection';
import {
  PortfolioMockup,
  TraderProfileMockup,
  AnalyticsMockup,
  SocialFeedMockup,
  MarketMockup,
} from '@/app/components/FeatureMockups';
import { HowItWorks } from '@/app/components/HowItWorks';
import { Leaderboard } from '@/app/components/Leaderboard';
import { FinalCTA } from '@/app/components/FinalCTA';
import { Footer } from '@/app/components/Footer';
import { GalaxyBg } from '@/app/components/GalaxyBg';

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a]/90 text-white/70 backdrop-blur-sm transition-all hover:bg-[#AB51C5] hover:text-white"
      aria-label="Back to top"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14V2M2 7l6-5 6 5" />
      </svg>
    </button>
  );
}

export default function HomeClient() {
  const t = useTranslations();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Constellation Orb + Core Features Header */}
        <section className="relative overflow-hidden pt-12 pb-4 sm:pt-24 sm:pb-8" style={{ background: `
          radial-gradient(ellipse 80% 50% at 50% 35%, rgba(80,25,120,0.2) 0%, rgba(50,15,80,0.08) 40%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 30% 50%, rgba(100,40,160,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 70% 45%, rgba(60,20,140,0.05) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 50% 60%, rgba(120,50,180,0.04) 0%, transparent 50%),
          linear-gradient(180deg, rgba(10,4,20,0.4) 0%, rgba(15,6,30,0.5) 30%, rgba(10,4,20,0.5) 70%, rgba(5,2,10,0.6) 100%)
        ` }}>
          <GalaxyBg />
          <div className="container relative mx-auto px-6 text-center">
            <h2 className="mb-4 mx-auto max-w-4xl bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl md:text-5xl">
              {t('home.coreHeading')}
            </h2>
          </div>
          <div className="relative">
            <ConstellationOrb />
          </div>
        </section>

        {/* Feature 1: Performance Analytics */}
        <FeatureSection
          title={t('features.analytics.title')}
          description={t('features.analytics.description')}
          highlights={[t('features.analytics.highlights.0'), t('features.analytics.highlights.1'), t('features.analytics.highlights.2')]}
          visual={<PortfolioMockup />}
        />

        {/* Feature 2: Unified Exchange View */}
        <FeatureSection
          title={t('features.exchange.title')}
          description={t('features.exchange.description')}
          highlights={[t('features.exchange.highlights.0'), t('features.exchange.highlights.1'), t('features.exchange.highlights.2'), t('features.exchange.highlights.3')]}
          visual={<TraderProfileMockup />}
          reversed
        />

        {/* Feature 3: Get Connected */}
        <FeatureSection
          title={t('features.social.title')}
          description={t('features.social.description')}
          highlights={[t('features.social.highlights.0'), t('features.social.highlights.1'), t('features.social.highlights.2'), t('features.social.highlights.3')]}
          visual={<AnalyticsMockup />}
        />

        {/* Feature 4: Discover Top Traders */}
        <FeatureSection
          title={t('features.discover.title')}
          description={t('features.discover.description')}
          highlights={[t('features.discover.highlights.0'), t('features.discover.highlights.1'), t('features.discover.highlights.2'), t('features.discover.highlights.3')]}
          visual={<SocialFeedMockup />}
          reversed
        />

        {/* Feature 5: Market Intelligence */}
        <FeatureSection
          title={t('features.market.title')}
          description={t('features.market.description')}
          highlights={[t('features.market.highlights.0'), t('features.market.highlights.1'), t('features.market.highlights.2'), t('features.market.highlights.3')]}
          visual={<MarketMockup />}
        />

        {/* How It Works */}
        <HowItWorks />

        {/* Leaderboard */}
        <Leaderboard />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
