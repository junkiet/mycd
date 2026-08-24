'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Compass, LineChart, Trophy, ArrowRight, Globe, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing, LOCALE_LABELS, LOCALE_SHORT_LABELS } from '@/i18n/routing';
import { Button } from './ui/button';

function localeLabel(loc: string) {
  return LOCALE_LABELS[loc] || loc.toUpperCase();
}

function localeShortLabel(loc: string) {
  return LOCALE_SHORT_LABELS[loc] || loc.toUpperCase();
}

export function Navbar() {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: 'https://app.mycoindeck.com/en/explore', label: t('exploreTraders'), icon: Compass },
    { href: 'https://app.mycoindeck.com/en/feeds', label: t('feed'), icon: LineChart },
    { href: '#leaderboard', label: t('leaderboard'), icon: Trophy },
  ];

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setLangOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex min-w-0 cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="Back to top"
          >
            <img src="/logo.svg" alt="MyCoinDeck Logo" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
            <span className="truncate text-lg font-bold uppercase tracking-tight sm:text-xl" style={{ fontFamily: "'GetVoIP Grotesque', sans-serif" }}>MyCoinDeck</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}

            {/* Desktop Language Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                <Globe className="h-4 w-4" />
                {localeShortLabel(locale)}
                <svg className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[160px] max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-lg border border-white/10 bg-black/90 py-1 backdrop-blur-xl shadow-xl">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLocale(loc)}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                        loc === locale ? 'text-[#BA7CFF]' : 'text-white/70'
                      }`}
                    >
                      {localeLabel(loc)}
                      {loc === locale && <Check className="ml-auto h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href="https://app.mycoindeck.com"
              className="rounded-full bg-[#BA7CFF] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#a866f0] shadow-lg shadow-[#BA7CFF]/30"
            >
              {t('getStarted')}
            </a>
          </div>

          {/* Mobile Hamburger */}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10 md:hidden"
                aria-label={t('menu')}
              >
                <Menu className="h-5 w-5 text-white" />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content
                className="fixed right-0 top-0 bottom-0 z-50 flex w-[85vw] max-w-sm flex-col border-l border-white/10 bg-[#0b0a0d] shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200"
              >
                <Dialog.Title className="sr-only">{t('menu')}</Dialog.Title>
                <Dialog.Description className="sr-only">Navigation menu</Dialog.Description>

                {/* Header */}
                <div className="flex items-center justify-end border-b border-white/5 px-3 py-3">
                  <Dialog.Close asChild>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {/* Nav links */}
                  <div className="px-3 py-3">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Dialog.Close asChild key={link.href}>
                          <a
                            href={link.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/5"
                          >
                            <Icon className="h-5 w-5 shrink-0 text-white/70" />
                            <span className="flex-1">{link.label}</span>
                          </a>
                        </Dialog.Close>
                      );
                    })}
                  </div>

                  {/* Language section */}
                  <div className="border-t border-white/5 px-3 py-3">
                    <div className="mb-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                      <Globe className="h-3.5 w-3.5" />
                      {t('language')}
                    </div>
                    <div className="flex flex-col">
                      {routing.locales.map((loc) => {
                        const isCurrent = loc === locale;
                        return (
                          <button
                            key={loc}
                            onClick={() => switchLocale(loc)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors hover:bg-white/5 ${
                              isCurrent ? 'text-[#BA7CFF]' : 'text-white/80'
                            }`}
                          >
                            <span className="flex-1 text-left">{localeLabel(loc)}</span>
                            {isCurrent && <Check className="h-4 w-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sticky CTA footer */}
                <div className="border-t border-white/5 px-4 py-4">
                  <Dialog.Close asChild>
                    <a href="https://app.mycoindeck.com" className="block">
                      <Button className="w-full bg-[#BA7CFF] hover:bg-[#a866f0] shadow-lg shadow-[#BA7CFF]/30">
                        {t('getStarted')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </nav>
  );
}
