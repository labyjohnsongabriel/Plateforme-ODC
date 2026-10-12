import type { Metadata } from 'next';
import { StatsOverview } from './components/StatsOverview';
import { QuickActions } from './components/QuickActions';
import { ProchainesSessions } from './components/ProchainesSessions';
import { RecentActivity } from './components/RecentActivity';

export const metadata: Metadata = { title: 'Mon tableau de bord' };

export default function ParticipantDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Bonjour 👋
        </h1>
        <p className="text-odc-muted mt-1">
          Voici votre parcours de formation chez Orange Digital Center
        </p>
      </header>

      <StatsOverview />
      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProchainesSessions />
        <RecentActivity />
      </div>
    </div>
  );
}