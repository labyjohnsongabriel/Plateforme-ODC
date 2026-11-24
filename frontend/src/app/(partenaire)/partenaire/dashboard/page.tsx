// src/app/(partenaire)/partenaire/dashboard/page.tsx
import type { Metadata } from 'next';
import { Handshake } from 'lucide-react';
import { StatsOverview } from './components/StatsOverview';
import { FormationsPubliees } from './components/FormationsPubliees';

export const metadata: Metadata = { title: 'Tableau de bord Partenaire' };

export default function PartenaireDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20">
            <Handshake className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <div>
           <h1 className="font-display text-2xl md:text-3xl font-bold">
          Bienvenue dans votre espace 
        </h1>
            <p className="mt-1 text-muted-foreground">
              Découvrez les formations et l&apos;activité de l&apos;Orange Digital Center
            </p>
          </div>
        </div>
      </header>

      <StatsOverview />
      <FormationsPubliees />
    </div>
  );
}