import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { routing } from '@/i18n/routing';
import '../globals.css';

const GA_MEASUREMENT_ID = 'G-201D19SYZQ';

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
    icon: '/logo.svg',
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
        <meta name="referrer" content="no-referrer" />
        <link
          rel="preload"
          as="video"
          href="/hero-v2.mp4"
          type="video/mp4"
          fetchPriority="high"
        />
        <link
          href="https://fonts.cdnfonts.com/css/good-timing"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
