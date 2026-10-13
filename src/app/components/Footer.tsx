'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { SUPPORT_EMAIL } from '@/config/site';

// The legal links here are what App Store / Play review looks for: privacy
// policy, terms and a support/contact page reachable from the site footer.
export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  const links = [
    { href: `/${locale}/privacy`, label: t('privacyPolicy') },
    { href: `/${locale}/terms`, label: t('termsOfService') },
    { href: `/${locale}/support`, label: t('support') },
  ];

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
              <img src="/logo.svg" alt="MyCoinDeck" className="h-7 w-7" />
              <span className="text-base font-bold uppercase tracking-tight" style={{ fontFamily: "'GetVoIP Grotesque', sans-serif" }}>
                MyCoinDeck
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/45">{t('description')}</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block text-sm text-white/60 transition-colors hover:text-[#BA7CFF]">
              {SUPPORT_EMAIL}
            </a>
          </div>

          <nav aria-label="Legal" className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-white/60 transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-xs text-white/40">{t('copyright')}</div>
      </div>
    </footer>
  );
}
