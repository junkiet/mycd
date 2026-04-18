import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MyCoinDeck — Unified Crypto Trading Dashboard',
  description:
    'MyCoinDeck unifies all your crypto trading data into one powerful dashboard. Track PnL, analytics, leaderboards, and social trading across Binance, Bybit, OKX, and Bitget.',
  keywords: [
    'crypto trading',
    'trading dashboard',
    'PnL tracker',
    'Binance',
    'Bybit',
    'OKX',
    'Bitget',
    'crypto portfolio',
    'trading analytics',
    'social trading',
  ],
  openGraph: {
    title: 'MyCoinDeck — Unified Crypto Trading Dashboard',
    description:
      'Track PnL, analytics, leaderboards, and social trading across all your exchanges in one place.',
    url: 'https://mycoindeck.com',
    siteName: 'MyCoinDeck',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyCoinDeck — Unified Crypto Trading Dashboard',
    description:
      'Track PnL, analytics, leaderboards, and social trading across all your exchanges in one place.',
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/good-timing"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
