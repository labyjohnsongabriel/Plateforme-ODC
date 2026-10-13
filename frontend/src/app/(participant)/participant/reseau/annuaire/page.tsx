import type { Metadata } from 'next';
import { DirectoryGrid } from '../components/DirectoryGrid';
import { DirectoryFilters } from '../components/DirectoryFilters';

export const metadata: Metadata = { title: 'Annuaire' };

export default function AnnuairePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Annuaire</h1>
        <p className="text-odc-muted mt-1">
          Découvrez les membres de la communauté ODC
        </p>
      </header>

      <DirectoryFilters />
      <DirectoryGrid />
    </div>
  );
}