import type { Metadata } from 'next';
import { PartenairesGrid } from './components/PartenairesGrid';

export const metadata: Metadata = { title: 'Partenaires' };

export default function StaffPartenairesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Partenaires</h1>
        <p className="text-odc-muted mt-1">
          Consultez et gérez les partenaires de l&apos;ODC
        </p>
      </header>
      <PartenairesGrid />
    </div>
  );
}