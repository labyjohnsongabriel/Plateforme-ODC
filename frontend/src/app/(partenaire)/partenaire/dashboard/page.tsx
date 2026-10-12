import type { Metadata } from 'next';
import { StatsOverview } from './components/StatsOverview';
import { FormationsPubliees } from './components/FormationsPubliees';

export const metadata: Metadata = { title: 'Tableau de bord Partenaire' };

export default function PartenaireDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Bienvenue 🤝
        </h1>
        <p className="text-odc-muted mt-1">
          Découvrez les formations et l&apos;activité de l&apos;Orange Digital Center
        </p>
      </header>

      <StatsOverview />
      <FormationsPubliees />
    </div>
  );
}