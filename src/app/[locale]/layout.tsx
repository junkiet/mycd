import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { routing, bcp47, LOCALE_BCP47 } from '@/i18n/routing';
import '../globals.css';
import '../vant-icons.css';

const GA_MEASUREMENT_ID = 'G-201D19SYZQ';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const SITE_URL = 'https://mycoindeck.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
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
    // One <link rel="alternate"> per language so a crawler that lands on any
    // one of them finds the other four. Keyed by route code, valued with the
    // BCP-47 tag — /kr must be announced as hreflang="ko".
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((loc) => [LOCALE_BCP47[loc], `${SITE_URL}/${loc}`]),
        ),
        'x-default': `${SITE_URL}/${routing.defaultLocale}`,
      },
    },
    icons: {
      // ?v= 用于刷新浏览器对 favicon 的长期缓存，换图后手动 +1
      icon: [{ url: '/favicon.png?v=2', type: 'image/png', sizes: '512x512' }],
      shortcut: '/favicon.png?v=2',
      apple: '/apple-touch-icon.png?v=2',
    },
  };
}

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
    <html lang={bcp47(locale)}>
      <head>
        <meta name="referrer" content="no-referrer" />
        <link
          rel="preload"
          as="video"
          href="/hero-v2.mp4"
          type="video/mp4"
          fetchPriority="high"
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
