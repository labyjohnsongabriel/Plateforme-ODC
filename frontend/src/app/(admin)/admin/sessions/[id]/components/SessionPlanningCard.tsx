'use client';

import {
  Calendar,
  MapPin,
  Video,
  Clock,
  ExternalLink,
  CalendarClock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime } from '@/lib/formatters';
import type { Session } from '@/hooks/useSessions';

interface SessionPlanningCardProps {
  session: Session;
}

export function SessionPlanningCard({ session }: SessionPlanningCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-odc-primary" />
          Planning & localisation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <PlanningItem
            icon={Calendar}
            label="Début"
            value={formatDate(session.dateDebut)}
            subvalue={formatTimeOnly(session.dateDebut)}
          />
          <PlanningItem
            icon={Calendar}
            label="Fin"
            value={formatDate(session.dateFin)}
            subvalue={formatTimeOnly(session.dateFin)}
          />
        </div>

        {/* Localisation */}
        <div className="grid gap-4 sm:grid-cols-2">
          {session.lieu && (
            <PlanningItem
              icon={MapPin}
              label="Lieu"
              value={session.lieu}
            />
          )}
          {session.lienVisio && (
            <div className="rounded-lg border border-odc-border p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-odc-info-soft">
                  <Video className="h-3.5 w-3.5 text-odc-info" />
                </div>
                <p className="text-xs font-medium text-odc-text-muted">
                  Visioconférence
                </p>
              </div>
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto p-0 text-xs"
                onClick={() => window.open(session.lienVisio, '_blank')}
                rightIcon={<ExternalLink className="h-3 w-3" />}
              >
                Rejoindre la visio
              </Button>
            </div>
          )}
        </div>

        {/* Inscriptions */}
        {(session.dateOuvertureInscriptions ||
          session.dateFermetureInscriptions) && (
          <div className="rounded-lg bg-odc-surface-alt/50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
              Période d'inscription
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {session.dateOuvertureInscriptions && (
                <div>
                  <p className="text-xs text-odc-text-muted">Ouverture</p>
                  <p className="text-sm font-medium text-odc-text-primary">
                    {formatDateTime(session.dateOuvertureInscriptions)}
                  </p>
                </div>
              )}
              {session.dateFermetureInscriptions && (
                <div>
                  <p className="text-xs text-odc-text-muted">Fermeture</p>
                  <p className="text-sm font-medium text-odc-text-primary">
                    {formatDateTime(session.dateFermetureInscriptions)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   SOUS-COMPOSANT
   ============================================================================ */

interface PlanningItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subvalue?: string;
}

function PlanningItem({
  icon: Icon,
  label,
  value,
  subvalue,
}: PlanningItemProps) {
  return (
    <div className="rounded-lg border border-odc-border p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-odc-primary-soft">
          <Icon className="h-3.5 w-3.5 text-odc-primary" />
        </div>
        <p className="text-xs font-medium text-odc-text-muted">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-odc-text-primary">
        {value}
      </p>
      {subvalue && (
        <p className="mt-0.5 text-xs text-odc-text-muted">{subvalue}</p>
      )}
    </div>
  );
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function formatTimeOnly(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}