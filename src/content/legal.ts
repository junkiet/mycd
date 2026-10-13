import type { Metadata } from 'next';
import { routing, LOCALE_BCP47 } from '@/i18n/routing';
import { SITE_URL } from '@/config/site';

// Legal copy lives in locales/legal/<locale>.json, separate from the main
// message bundle so the (long) policy text is never shipped to the client on
// the home page. The pages are server components and read it directly.

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  note?: string;
};

export type LegalDoc = {
  title: string;
  description: string;
  intro: string[];
  sections: LegalSection[];
};

export type SupportChannel = { title: string; body: string; cta: string };

export type SupportContent = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  channels: { email: SupportChannel; help: SupportChannel; security: SupportChannel };
  tips: { title: string; intro: string; items: string[]; note: string };
  faq: { title: string; items: { q: string; a: string }[] };
  account: { title: string; items: { title: string; body: string }[] };
  legal: { title: string; privacy: string; terms: string };
};

export type LegalMessages = {
  meta: {
    lastUpdated: string;
    onThisPage: string;
    questionsTitle: string;
    questionsBody: string;
  };
  privacy: LegalDoc;
  terms: LegalDoc;
  support: SupportContent;
};

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  en: () => import('../../locales/legal/en.json'),
  zh: () => import('../../locales/legal/zh.json'),
  zt: () => import('../../locales/legal/zt.json'),
  pt: () => import('../../locales/legal/pt.json'),
  kr: () => import('../../locales/legal/kr.json'),
};

export async function getLegal(locale: string): Promise<LegalMessages> {
  const load = loaders[locale] ?? loaders[routing.defaultLocale];
  return (await load()).default as LegalMessages;
}

export type LegalPath = 'privacy' | 'terms' | 'support';

// Title/description/canonical/hreflang for one legal page. Mirrors the
// alternates block in [locale]/layout.tsx so every language variant of
// /privacy points at its siblings.
export function legalMetadata(
  locale: string,
  path: LegalPath,
  title: string,
  description: string,
): Metadata {
  const fullTitle = `${title} — MyCoinDeck`;
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/${path}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((loc) => [LOCALE_BCP47[loc], `${SITE_URL}/${loc}/${path}`]),
        ),
        'x-default': `${SITE_URL}/${routing.defaultLocale}/${path}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: `${SITE_URL}/${locale}/${path}`,
      siteName: 'MyCoinDeck',
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

// "September 3, 2026" in the reader's language. Parsed as UTC so the date
// can't slip a day depending on the server's time zone.
export function formatLegalDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale] ?? 'en', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
