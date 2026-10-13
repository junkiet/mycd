import type { Metadata } from 'next';
import { getLegal, legalMetadata } from '@/content/legal';
import { LegalShell } from '@/app/components/legal/LegalShell';
import { LegalDocument } from '@/app/components/legal/LegalDocument';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const { terms } = await getLegal(locale);
  return legalMetadata(locale, 'terms', terms.title, terms.description);
}

export default async function TermsPage({ params }: Params) {
  const { locale } = await params;
  const legal = await getLegal(locale);
  const labels = { privacy: legal.privacy.title, terms: legal.terms.title, support: legal.support.title };
  return (
    <LegalShell>
      <LegalDocument doc={legal.terms} meta={legal.meta} labels={labels} locale={locale} />
    </LegalShell>
  );
}
