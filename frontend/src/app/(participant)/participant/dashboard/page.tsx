// src/app/(participant)/participant/dashboard/page.tsx
import type { Metadata } from 'next';
import { GraduationCap } from 'lucide-react';
import { StatsOverview } from './components/StatsOverview';
import { QuickActions } from './components/QuickActions';
import { ProchainesSessions } from './components/ProchainesSessions';
import { RecentActivity } from './components/RecentActivity';

export const metadata: Metadata = { title: 'Mon tableau de bord' };

export default function ParticipantDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20">
            <GraduationCap
              className="h-6 w-6 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Bonjour 
            </h1>
            <p className="mt-1 text-muted-foreground">
              Voici votre parcours de formation chez Orange Digital Center
            </p>
          </div>
        </div>
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