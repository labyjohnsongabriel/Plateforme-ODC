import type { Metadata } from 'next';
import { StaffStats } from './components/StaffStats';
import { UrgentActions } from './components/UrgentActions';

export const metadata: Metadata = { title: 'Tableau de bord Staff' };

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Bienvenue dans votre espace 👋
        </h1>
        <p className="text-odc-muted mt-1">
          Gérez les formations, sélections et présences de l&apos;ODC
        </p>
      </header>

      <StaffStats />
      <UrgentActions />
    </div>
  );
}