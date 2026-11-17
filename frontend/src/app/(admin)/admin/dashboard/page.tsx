// src/app/(admin)/admin/dashboard/page.tsx
// ⭐ PAS de 'use client' ici — c'est un Server Component

import type { Metadata } from 'next';
import { LayoutDashboard } from 'lucide-react';
import { RefreshDashboardButton } from './components/RefreshDashboardButton';
import { StatsOverview } from './components/StatsOverview';
import { ChartsSection } from './components/ChartsSection';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { TopFormations } from './components/TopFormations';
import { PendingApprovals } from './components/PendingApprovals';
import { RecentUsers } from './components/RecentUsers';
import { SystemStatus } from './components/SystemStatus';

export const metadata: Metadata = {
  title: 'Tableau de bord Admin',
  description: 'Vue d\'ensemble complète de la plateforme ODC',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ================================================================ */}
      {/* HEADER                                                            */}
      {/* ================================================================ */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icône : dégradé basé sur --primary (light + dark compatible) */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md
                       bg-gradient-to-br from-primary to-primary/80
                       ring-1 ring-primary/20"
          >
            <LayoutDashboard className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Tableau de bord
            </h1>
            <p className="mt-1 text-muted-foreground">
              Vue d&apos;ensemble de la plateforme Orange Digital Center
            </p>
          </div>
        </div>

        <RefreshDashboardButton />
      </header>

      {/* ================================================================ */}
      {/* KPIs                                                              */}
      {/* ================================================================ */}
      <StatsOverview />

      {/* ================================================================ */}
      {/* Actions rapides                                                   */}
      {/* ================================================================ */}
      <QuickActions />

      {/* ================================================================ */}
      {/* Graphiques                                                        */}
      {/* ================================================================ */}
      <ChartsSection />

      {/* ================================================================ */}
      {/* Grille : Top + Attente + Users                                    */}
      {/* ================================================================ */}
      <div className="grid gap-6 lg:grid-cols-3">
        <TopFormations />
        <PendingApprovals />
        <RecentUsers />
      </div>

      {/* ================================================================ */}
      {/* Activité + État système                                           */}
      {/* ================================================================ */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <SystemStatus />
      </div>
    </div>
  );
}