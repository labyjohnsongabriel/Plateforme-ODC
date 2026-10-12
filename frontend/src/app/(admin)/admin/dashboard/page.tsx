// src/app/(admin)/admin/dashboard/page.tsx
// ⭐ PAS de 'use client' ici — c'est un Server Component

import type { Metadata } from 'next';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-odc-500 to-odc-700 flex items-center justify-center shadow-odc-md">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-odc-text-primary">
              Tableau de bord
            </h1>
            <p className="text-odc-muted mt-1">
              Vue d&apos;ensemble de la plateforme Orange Digital Center
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/dashboard">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Link>
        </Button>
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