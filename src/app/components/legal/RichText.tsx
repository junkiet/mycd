import type { ReactNode } from 'react';
import Link from 'next/link';
import { APP_URL, SUPPORT_EMAIL } from '@/config/site';

// Legal copy is plain text with a handful of {tokens} that turn into links,
// so translators never touch markup. Unknown tokens render verbatim.
type Props = {
  text: string;
  locale: string;
  labels: { privacy: string; terms: string; support: string };
};

const LINK_CLASS = 'text-[#BA7CFF] underline decoration-[#BA7CFF]/40 underline-offset-4 transition-colors hover:text-white';

export function RichText({ text, locale, labels }: Props) {
  const parts = text.split(/(\{[a-z]+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\{([a-z]+)\}$/);
        if (!m) return part;
        const node = renderToken(m[1], locale, labels);
        return node === null ? part : <span key={i}>{node}</span>;
      })}
    </>
  );
}

function renderToken(token: string, locale: string, labels: Props['labels']): ReactNode | null {
  switch (token) {
    case 'email':
      return (
        <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK_CLASS}>
          {SUPPORT_EMAIL}
        </a>
      );
    case 'privacy':
      return (
        <Link href={`/${locale}/privacy`} className={LINK_CLASS}>
          {labels.privacy}
        </Link>
      );
    case 'terms':
      return (
        <Link href={`/${locale}/terms`} className={LINK_CLASS}>
          {labels.terms}
        </Link>
      );
    case 'support':
      return (
        <Link href={`/${locale}/support`} className={LINK_CLASS}>
          {labels.support}
        </Link>
      );
    case 'help':
      return (
        <a href={`${APP_URL}/${locale}/help`} className={LINK_CLASS} target="_blank" rel="noopener noreferrer">
          {`${APP_URL.replace('https://', '')}/${locale}/help`}
        </a>
      );
    default:
      return null;
  }
}
