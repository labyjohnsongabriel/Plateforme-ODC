import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormationGrid } from './components/FormationGrid';
import { FormationGridSkeleton } from './components/FormationGridSkeleton';
import { FormationFilters } from './components/FormationFilters';
import { FormationSearch } from './components/FormationSearch';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Catalogue des formations',
  description:
    "Découvrez toutes les formations numériques proposées par l'Orange Digital Center Madagascar.",
};

export default function FormationsPage() {
  return (
    <>
      <PageHero
        title="Nos formations"
        subtitle="Explorez notre catalogue de formations numériques — développement, data, design, cybersécurité et plus"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Formations' }]}
      />

      <div className="container-page py-12">
        <FormationSearch />

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 mt-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <FormationFilters />
          </aside>

          <div>
            <Suspense fallback={<FormationGridSkeleton />}>
              <FormationGrid />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}