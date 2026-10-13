import type { Metadata } from 'next';
import { getLegal, legalMetadata } from '@/content/legal';
import { LegalShell } from '@/app/components/legal/LegalShell';
import { LegalDocument } from '@/app/components/legal/LegalDocument';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const { privacy } = await getLegal(locale);
  return legalMetadata(locale, 'privacy', privacy.title, privacy.description);
}

export default async function PrivacyPage({ params }: Params) {
  const { locale } = await params;
  const legal = await getLegal(locale);
  const labels = { privacy: legal.privacy.title, terms: legal.terms.title, support: legal.support.title };
  return (
    <LegalShell>
      <LegalDocument doc={legal.privacy} meta={legal.meta} labels={labels} locale={locale} />
    </LegalShell>
  );
}
