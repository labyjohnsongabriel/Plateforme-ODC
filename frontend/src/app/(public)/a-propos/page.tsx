// src/app/(public)/a-propos/page.tsx
import type { Metadata } from 'next';
import { HistorySection } from './components/HistorySection';
import { ValuesSection } from './components/ValuesSection';
import { TeamSection } from './components/TeamSection';
import { PageHero } from '@/components/shared/PageHero';

/* ═══════════════════════════════════════════════════════════════════════════
   MÉTADONNÉES SEO
   ═══════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: 'À propos — Orange Digital Center Madagascar',
  description:
    "Découvrez l'histoire, les valeurs et l'équipe de l'Orange Digital Center Madagascar. Un lieu d'innovation, de formation et d'inclusion numérique.",
  keywords: [
    'Orange Digital Center',
    'ODC Madagascar',
    'formation numérique',
    'inclusion numérique',
    'Antananarivo',
  ],
  openGraph: {
    title: 'À propos — Orange Digital Center Madagascar',
    description:
      "Découvrez l'histoire, les valeurs et l'équipe de l'Orange Digital Center Madagascar.",
    type: 'website',
    locale: 'fr_MG',
    siteName: 'Orange Digital Center Madagascar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'À propos — Orange Digital Center Madagascar',
    description:
      "Découvrez l'histoire, les valeurs et l'équipe de l'ODC Madagascar.",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* ═══════ Hero ═══════ */}
      <PageHero
        title="À propos de l'ODC"
        subtitle="Orange Digital Center Madagascar — un lieu d'innovation, de formation et d'inclusion numérique"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'À propos' },
        ]}
      />

      {/* ═══════ Sections (chacune gère son propre container) ═══════ */}
      <HistorySection />
      <ValuesSection />
      <TeamSection />
    </main>
  );
}