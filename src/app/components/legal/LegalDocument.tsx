import Link from 'next/link';
import type { LegalDoc, LegalMessages } from '@/content/legal';
import { formatLegalDate } from '@/content/legal';
import { LEGAL_LAST_UPDATED } from '@/config/site';
import { RichText } from './RichText';

type Props = {
  doc: LegalDoc;
  meta: LegalMessages['meta'];
  labels: { privacy: string; terms: string; support: string };
  locale: string;
};

const slug = (i: number) => `section-${i + 1}`;

export function LegalDocument({ doc, meta, labels, locale }: Props) {
  const rich = (text: string) => <RichText text={text} locale={locale} labels={labels} />;

  return (
    <article>
      <header className="mb-10 border-b border-white/10 pb-8">
        <h1 className="bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl">
          {doc.title}
        </h1>
        <p className="mt-4 text-sm text-white/40">
          {meta.lastUpdated}: {formatLegalDate(LEGAL_LAST_UPDATED, locale)}
        </p>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-white/70">
          {doc.intro.map((p, i) => (
            <p key={i}>{rich(p)}</p>
          ))}
        </div>
      </header>

      <nav aria-label={meta.onThisPage} className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">{meta.onThisPage}</div>
        <ol className="grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
          {doc.sections.map((s, i) => (
            <li key={i}>
              <a href={`#${slug(i)}`} className="flex gap-2 text-white/60 transition-colors hover:text-white">
                <span className="w-5 shrink-0 tabular-nums text-white/30">{i + 1}.</span>
                <span>{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-12">
        {doc.sections.map((s, i) => (
          <section key={i} id={slug(i)} className="scroll-mt-28">
            <h2 className="mb-4 flex gap-3 text-xl font-semibold text-white sm:text-2xl">
              <span className="tabular-nums text-[#BA7CFF]">{i + 1}.</span>
              <span>{s.title}</span>
            </h2>
            <div className="space-y-4 text-[15px] leading-relaxed text-white/70">
              {s.paragraphs?.map((p, j) => (
                <p key={j}>{rich(p)}</p>
              ))}
              {s.items && (
                <ul className="space-y-2.5 pl-1">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#BA7CFF]/70" />
                      <span>{rich(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.note && (
                <p className="rounded-xl border border-[#BA7CFF]/20 bg-[#BA7CFF]/[0.06] px-4 py-3 text-[14px] text-white/75">
                  {rich(s.note)}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <aside className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-[#BA7CFF]/10 to-transparent p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">{meta.questionsTitle}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/70">{rich(meta.questionsBody)}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link href={`/${locale}/support`} className="rounded-full bg-[#BA7CFF] px-4 py-2 font-medium text-white transition-colors hover:bg-[#a866f0]">
            {labels.support}
          </Link>
          <Link href={`/${locale}/privacy`} className="rounded-full border border-white/15 px-4 py-2 text-white/70 transition-colors hover:border-white/40 hover:text-white">
            {labels.privacy}
          </Link>
          <Link href={`/${locale}/terms`} className="rounded-full border border-white/15 px-4 py-2 text-white/70 transition-colors hover:border-white/40 hover:text-white">
            {labels.terms}
          </Link>
        </div>
      </aside>
    </article>
  );
}
