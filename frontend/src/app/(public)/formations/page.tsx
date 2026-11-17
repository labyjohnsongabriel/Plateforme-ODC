// src/app/(public)/formations/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { FormationGrid } from './components/FormationGrid';
import { FormationGridSkeleton } from './components/FormationGridSkeleton';
import { FormationFilters } from './components/FormationFilters';
import { FormationSearch } from './components/FormationSearch';
import { PageHero } from '@/components/shared/PageHero';

/* ═══════════════════════════════════════════════════════════════════════════
   MÉTADONNÉES SEO
   ═══════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: 'Catalogue des formations — ODC Madagascar',
  description:
    "Découvrez toutes les formations numériques proposées par l'Orange Digital Center Madagascar : développement web, data science, cybersécurité, design et bien plus.",
  keywords: [
    'formations numériques',
    'ODC Madagascar',
    'développement web',
    'data science',
    'cybersécurité',
    'design',
    'Antananarivo',
    'Fianarantsoa',
  ],
  openGraph: {
    title: 'Catalogue des formations — ODC Madagascar',
    description:
      "Découvrez toutes les formations numériques de l'Orange Digital Center Madagascar.",
    type: 'website',
    locale: 'fr_MG',
    siteName: 'Orange Digital Center Madagascar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catalogue des formations — ODC Madagascar',
    description:
      "Découvrez toutes les formations numériques de l'ODC Madagascar.",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function FormationsPage() {
  return (
    <main className="min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════════ */}
      <PageHero
        title="Nos formations"
        subtitle="Explorez notre catalogue de formations numériques — développement, data, design, cybersécurité et plus"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Formations' },
        ]}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          INTRODUCTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-muted/20 py-8">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                <BookOpen className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Trouvez votre formation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Filtrez par domaine, niveau ou certification
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              100% gratuit
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENU PRINCIPAL
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-page py-12">
        {/* Barre de recherche */}
        <FormationSearch />

        {/* Grille filtres + résultats */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* ═══════ Sidebar filtres ═══════ */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <FormationFilters />
          </aside>

          {/* ═══════ Résultats ═══════ */}
          <div className="min-w-0">
            <Suspense fallback={<FormationGridSkeleton />}>
              <FormationGrid />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}