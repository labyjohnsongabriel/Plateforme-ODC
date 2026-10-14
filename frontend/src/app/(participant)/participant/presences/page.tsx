// src/app/(participant)/participant/presences/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Camera, QrCode, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MyPresencesList } from './components/MyPresencesList';
import { PresenceStats } from './components/PresenceStats';
import { PresenceFilters } from './components/PresenceFilters';

/* ============================================================================
   METADATA
   ============================================================================ */

export const metadata: Metadata = {
  title: 'Mes présences | ODC Formations',
  description:
    'Consultez l\'historique de vos présences aux sessions de formation ODC.',
};

/* ============================================================================
   PAGE
   ============================================================================ */

export default function PresencesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ================================================================
          EN-TÊTE DE PAGE
          ================================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-odc-500 to-odc-700 shadow-odc-primary-sm">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                Mes présences
              </h1>
              <p className="mt-0.5 text-sm text-odc-text-muted">
                Consultez l&apos;historique de vos présences aux sessions.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="odc"
          size="lg"
          asChild
          className="shrink-0"
        >
          <Link href="/participant/presences/scanner">
            <Camera className="mr-2 h-4 w-4" />
            Scanner un QR code
          </Link>
        </Button>
      </div>

      {/* ================================================================
          BANDEAU D'INFORMATION
          ================================================================ */}
      <Card className="border-odc-info/30 bg-odc-info-soft/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-odc-info-soft">
              <Info className="h-4 w-4 text-odc-info" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-odc-info-dark">
                Comment ça marche ?
              </p>
              <p className="mt-0.5 text-xs text-odc-text-secondary">
                Lors de chaque session, votre formateur affiche un{' '}
                <strong>QR code</strong> à scanner. Vous pouvez également saisir
                manuellement le code affiché si la caméra n&apos;est pas
                disponible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          STATISTIQUES
          ================================================================ */}
      <PresenceStats />

      {/* ================================================================
          FILTRES
          ================================================================ */}
      <PresenceFilters />

      {/* ================================================================
          LISTE DES PRÉSENCES
          ================================================================ */}
      <MyPresencesList />
    </div>
  );
}