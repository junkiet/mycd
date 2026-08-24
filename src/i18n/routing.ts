import { defineRouting } from 'next-intl/routing';

// Codes deliberately match app.mycoindeck.com's route prefixes (see the app's
// src/utils/i18n.ts), NOT BCP-47: zt = Traditional Chinese, pt = Brazilian
// Portuguese, kr = Korean. Two things depend on the match — FeatureMockups'
// traderUrl() builds app.mycoindeck.com/<locale>/explore/... and useGoApiLang
// fetches /goapi/lang/<locale> — so a user crossing from the marketing site to
// the app keeps their language. The BCP-47 tags live in LOCALE_BCP47 below and
// are emitted for <html lang> and hreflang only.
export const routing = defineRouting({
  locales: ['en', 'zh', 'zt', 'pt', 'kr'],
  defaultLocale: 'en',
});

// Route code → the tag crawlers and screen readers expect.
export const LOCALE_BCP47: Record<string, string> = {
  en: 'en',
  zh: 'zh-Hans',
  zt: 'zh-Hant',
  pt: 'pt-BR',
  kr: 'ko',
};

export const bcp47 = (locale: string) => LOCALE_BCP47[locale] ?? locale;

// Written in each language's own script — someone who can't read the current UI
// language still has to be able to find their own row in the switcher.
export const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  zh: '中文 (简体)',
  zt: '中文 (繁體)',
  pt: 'Português (BR)',
  kr: '한국어',
};

// Compact form for the navbar trigger, where the full endonym ("Português (BR)")
// would push the nav row wide. The dropdown still shows LOCALE_LABELS.
export const LOCALE_SHORT_LABELS: Record<string, string> = {
  en: 'EN',
  zh: '中(简体)',
  zt: '中(繁體)',
  pt: 'PT-BR',
  kr: '한국어',
};
