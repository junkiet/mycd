'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Compass, LineChart, Trophy, LogIn, ArrowRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Button } from './ui/button';

const localeLabels: Record<string, string> = {
  en: 'English',
  zh: '中文',
};

export function Navbar() {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
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
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > 80 && y > lastScrollY.current);
      lastScrollY.current = y;
    };
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
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        hidden ? '-top-20' : 'top-0'
      } ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-2">
            <img src="/favicon.png" alt="MyCoinDeck Logo" className="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9" />
            <span className="truncate text-lg font-bold uppercase tracking-tight sm:text-xl" style={{ fontFamily: "'Good Timing', sans-serif" }}>MyCoinDeck</span>
          </div>

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

            {/* Language Switcher Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {localeLabels[locale] || locale.toUpperCase()}
                <svg className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[120px] overflow-hidden rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLocale(loc)}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                        loc === locale ? 'text-[#AB51C5]' : 'text-white/70'
                      }`}
                    >
                      {localeLabels[loc] || loc.toUpperCase()}
                      {loc === locale && (
                        <svg className="ml-auto h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href="https://app.mycoindeck.com"
              className="rounded-full bg-[#AB51C5] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#a45fbd] shadow-lg shadow-[#AB51C5]/30"
            >
              {t('getStarted')}
            </a>
          </div>

          {/* Mobile Hamburger */}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-white" />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content
                className="fixed left-1 right-1 bottom-1 z-50 rounded-xl bg-[rgba(25,24,27,0.90)] p-2 text-[rgba(255,255,255,0.64)] text-sm backdrop-blur-[12px] overflow-y-auto max-h-[90vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 duration-200"
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Navigation menu
                </Dialog.Description>

                {/* Header row */}
                <div className="flex items-center justify-between mb-1 px-1">
                  <div className="flex items-center justify-center size-10">
                    <img src="/favicon.png" alt="MyCoinDeck Logo" className="h-7 w-7 rounded-full" />
                  </div>

                  {/* Decorative dots */}
                  <svg width="30" height="6" viewBox="0 0 30 6" fill="none" className="pointer-events-none">
                    <circle cx="3" cy="3" r="3" fill="#AB51C5" fillOpacity="0.15" />
                    <circle cx="15" cy="3" r="3" fill="#AB51C5" fillOpacity="0.15" />
                    <circle cx="27" cy="3" r="3" fill="#AB51C5" fillOpacity="0.15" />
                  </svg>

                  <Dialog.Close asChild>
                    <button
                      className="p-2 text-[#848895] hover:text-white transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Nav links */}
                <nav className="px-3 divide-y divide-[rgba(238,228,255,0.06)]">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Dialog.Close asChild key={link.href}>
                        <a
                          href={link.href}
                          className="w-full flex items-center gap-3 py-4 text-[16px] font-medium hover:bg-gradient-to-r hover:from-transparent hover:via-white/5 hover:to-transparent transition-colors"
                        >
                          <Icon className="size-5 shrink-0 text-white" />
                          <span className="font-medium text-white grow">{link.label}</span>
                        </a>
                      </Dialog.Close>
                    );
                  })}

                  {/* Mobile Language Switcher */}
                  {routing.locales.filter((loc) => loc !== locale).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setOpen(false); switchLocale(loc); }}
                      className="w-full flex items-center gap-3 py-4 text-[16px] font-medium hover:bg-gradient-to-r hover:from-transparent hover:via-white/5 hover:to-transparent transition-colors"
                    >
                      <svg className="size-5 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="font-medium text-white grow">{localeLabels[loc] || loc.toUpperCase()}</span>
                    </button>
                  ))}
                </nav>

                {/* Get Started button */}
                <div className="px-3 pt-2 pb-2">
                  <Dialog.Close asChild>
                    <a href="https://app.mycoindeck.com" className="block">
                      <Button className="w-full bg-[#AB51C5] hover:bg-[#a45fbd] shadow-lg shadow-[#AB51C5]/30">
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
