import type { Metadata } from 'next';
import { StatsOverview } from './components/StatsOverview';
import { ProchainesSessions } from './components/ProchainesSessions';
import { QuickAccess } from './components/QuickAccess';

export const metadata: Metadata = { title: 'Tableau de bord Formateur' };

export default function FormateurDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Bonjour 👋
        </h1>
        <p className="text-odc-muted mt-1">
          Bienvenue dans votre espace formateur
        </p>
      </header>

      <StatsOverview />
      <QuickAccess />
      <ProchainesSessions />
    </div>
  );
}