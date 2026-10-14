'use client';

import {
  Users,
  Clock,
  MapPin,
  Video,
  UserCheck,
  Info,
  Calendar,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Session } from '@/hooks/useSessions';
import { cn } from '@/lib/utils';

interface SessionInfoCardProps {
  session: Session;
}

export function SessionInfoCard({ session }: SessionInfoCardProps) {
  const ratio =
    session.capacite > 0
      ? Math.round((session.inscriptionsCount / session.capacite) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-odc-primary" />
          Informations générales
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistiques */}
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoItem
            icon={Users}
            label="Capacité"
            value={`${session.inscriptionsCount}/${session.capacite}`}
            hint={`${ratio}% rempli`}
            tone={ratio >= 100 ? 'error' : ratio >= 80 ? 'warning' : 'primary'}
          />
          <InfoItem
            icon={Clock}
            label="Durée"
            value={calculateDuration(session.dateDebut, session.dateFin)}
          />
          <InfoItem
            icon={Calendar}
            label="Code session"
            value={session.codeSession}
            mono
          />
        </div>

        {/* Formateur */}
        {session.formateur ? (
          <div className="rounded-lg border border-odc-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-odc-primary-soft text-sm font-semibold text-odc-primary">
                {session.formateur.prenom.charAt(0)}
                {session.formateur.nom.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-odc-text-muted">
                  Formateur
                </p>
                <p className="truncate text-sm font-semibold text-odc-text-primary">
                  {session.formateur.prenom} {session.formateur.nom}
                </p>
                <p className="truncate text-xs text-odc-text-muted">
                  {session.formateur.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-odc-border p-4 text-center">
            <UserCheck className="mx-auto mb-2 h-5 w-5 text-odc-text-muted" />
            <p className="text-sm text-odc-text-muted">
              Aucun formateur assigné
            </p>
          </div>
        )}

        {/* Notes internes */}
        {session.notes && (
          <div className="rounded-lg bg-odc-surface-alt/50 p-3">
            <p className="text-xs font-medium text-odc-text-muted">
              Notes internes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-odc-text-secondary">
              {session.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   SOUS-COMPOSANT
   ============================================================================ */

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: 'primary' | 'success' | 'warning' | 'error';
  mono?: boolean;
}

const TONES = {
  primary: {
    bg: 'bg-odc-primary-soft',
    icon: 'text-odc-primary',
    value: 'text-odc-primary-active',
  },
  success: {
    bg: 'bg-odc-success-soft',
    icon: 'text-odc-success',
    value: 'text-odc-success-dark',
  },
  warning: {
    bg: 'bg-odc-warning-soft',
    icon: 'text-odc-warning',
    value: 'text-odc-warning-dark',
  },
  error: {
    bg: 'bg-odc-error-soft',
    icon: 'text-odc-error',
    value: 'text-odc-error-dark',
  },
};

function InfoItem({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
  mono,
}: InfoItemProps) {
  const t = TONES[tone];

  return (
    <div className="rounded-lg border border-odc-border p-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md',
            t.bg,
          )}
        >
          <Icon className={cn('h-3.5 w-3.5', t.icon)} />
        </div>
        <p className="text-xs font-medium text-odc-text-muted">{label}</p>
      </div>
      <p
        className={cn(
          'mt-2 font-display text-lg font-bold',
          t.value,
          mono && 'font-mono text-sm',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-odc-text-muted">{hint}</p>}
    </div>
  );
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function calculateDuration(debut: string, fin: string): string {
  if (!debut || !fin) return '—';

  const start = new Date(debut);
  const end = new Date(fin);
  const diff = end.getTime() - start.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return '1 jour';
  return `${days} jour${days > 1 ? 's' : ''}`;
}