import type { Metadata } from 'next';
import { FormationGrid } from '@/app/(public)/formations/components/FormationGrid';
import { FormationFilters } from '@/app/(public)/formations/components/FormationFilters';
import { FormationSearch } from '@/app/(public)/formations/components/FormationSearch';

export const metadata: Metadata = { title: 'Formations' };

export default function PartenaireFormationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Formations ODC
        </h1>
        <p className="text-odc-muted mt-1">
          Découvrez le catalogue complet des formations
        </p>
      </header>

      <FormationSearch />

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <FormationFilters />
        </aside>
        <FormationGrid />
      </div>
    </div>
  );
}