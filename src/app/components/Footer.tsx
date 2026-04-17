'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border/50 bg-black">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center text-sm text-muted-foreground">{t('copyright')}</div>
      </div>
    </footer>
  );
}
