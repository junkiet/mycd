import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageCircle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { getLegal, legalMetadata } from '@/content/legal';
import { APP_URL, SUPPORT_EMAIL } from '@/config/site';
import { LegalShell } from '@/app/components/legal/LegalShell';
import { RichText } from '@/app/components/legal/RichText';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const { support } = await getLegal(locale);
  return legalMetadata(locale, 'support', support.title, support.description);
}

const CARD = 'group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#BA7CFF]/40 hover:bg-white/[0.05]';

export default async function SupportPage({ params }: Params) {
  const { locale } = await params;
  const legal = await getLegal(locale);
  const s = legal.support;
  const labels = { privacy: legal.privacy.title, terms: legal.terms.title, support: s.title };
  const rich = (text: string) => <RichText text={text} locale={locale} labels={labels} />;

  const channels = [
    {
      ...s.channels.email,
      href: `mailto:${SUPPORT_EMAIL}`,
      cta: SUPPORT_EMAIL,
      icon: Mail,
      external: false,
    },
    {
      ...s.channels.help,
      href: `${APP_URL}/${locale}/help`,
      icon: MessageCircle,
      external: true,
    },
    {
      ...s.channels.security,
      href: `mailto:${SUPPORT_EMAIL}?subject=Security`,
      icon: ShieldAlert,
      external: false,
    },
  ];

  return (
    <LegalShell wide>
      <header className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#BA7CFF]">{s.title}</p>
        <h1 className="bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl">
          {s.heading}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/60">{s.intro}</p>
      </header>

      {/* Contact channels */}
      <section className="grid gap-4 md:grid-cols-3">
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.title}
              href={c.href}
              className={CARD}
              {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#BA7CFF]/15 text-[#BA7CFF]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{c.body}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 break-all text-sm font-medium text-[#BA7CFF] transition-colors group-hover:text-white">
                {c.cta}
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </span>
            </a>
          );
        })}
      </section>

      {/* What to include */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">{s.tips.title}</h2>
        <p className="mt-2 text-sm text-white/60">{s.tips.intro}</p>
        <ul className="mt-4 grid gap-2.5 text-sm text-white/70 sm:grid-cols-2">
          {s.tips.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#BA7CFF]/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100/80">
          {s.tips.note}
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{s.faq.title}</h2>
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
          {s.faq.items.map((f, i) => (
            <details key={i} className="group px-6 py-5 open:bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium text-white [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span className="mt-1 shrink-0 text-white/40 transition-transform group-open:rotate-45">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 1v12M1 7h12" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-relaxed text-white/65">{rich(f.a)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Account & data */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{s.account.title}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {s.account.items.map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{rich(item.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal */}
      <section className="mt-16 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#BA7CFF]/10 to-transparent p-6 sm:flex-row sm:items-center sm:p-8">
        <h2 className="text-lg font-semibold text-white">{s.legal.title}</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={`/${locale}/privacy`} className="rounded-full border border-white/15 px-4 py-2 text-white/70 transition-colors hover:border-white/40 hover:text-white">
            {s.legal.privacy}
          </Link>
          <Link href={`/${locale}/terms`} className="rounded-full border border-white/15 px-4 py-2 text-white/70 transition-colors hover:border-white/40 hover:text-white">
            {s.legal.terms}
          </Link>
        </div>
      </section>
    </LegalShell>
  );
}
