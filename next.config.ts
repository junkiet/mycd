import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Keep in sync with routing.locales (can't import it here without pulling
// next-intl into the config bundle).
const LOCALES = 'en|zh|zt|pt|kr';

// Common spellings of the legal/support URLs → canonical pages. Locale-less
// sources land on /privacy etc., which the next-intl middleware then prefixes
// with the visitor's locale (/privacy → /en/privacy).
const LEGAL_ALIASES: [string, string][] = [
  ['privacy-policy', 'privacy'],
  ['terms-of-service', 'terms'],
  ['terms-and-conditions', 'terms'],
  ['tos', 'terms'],
  ['contact', 'support'],
  ['contact-us', 'support'],
  ['help', 'support'],
];

const nextConfig: NextConfig = {
  async redirects() {
    return LEGAL_ALIASES.flatMap(([from, to]) => [
      { source: `/${from}`, destination: `/${to}`, permanent: true },
      { source: `/:locale(${LOCALES})/${from}`, destination: `/:locale/${to}`, permanent: true },
    ]);
  },
};

export default withNextIntl(nextConfig);
