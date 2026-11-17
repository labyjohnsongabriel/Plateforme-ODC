'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode,
  Building2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface SessionInfo {
  id: string;
  codeSession: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string | null;
  capacite?: number;
  statut: string;
  presenceOuverte: boolean;
  formation?: {
    id: string;
    titre: string;
    description?: string | null;
  } | null;
  formateur?: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
  } | null;
}

interface PresenceInfo {
  id: string;
  statut: string;
  methode?: string;
  datePresence: string;
  scanneLe?: string | null;
  heureScan?: string | null;
}

interface ParticipantDetail {
  session: SessionInfo;
  presence: PresenceInfo | null;
  inscription?: {
    id: string;
    statut: string;
  } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG = {
  PRESENT: {
    label: 'Présent',
    icon: CheckCircle2,
    color: 'text-odc-success',
    bg: 'bg-odc-success/10 ring-odc-success/20',
  },
  ABSENT: {
    label: 'Absent',
    icon: XCircle,
    color: 'text-odc-error',
    bg: 'bg-odc-error/10 ring-odc-error/20',
  },
  RETARD: {
    label: 'En retard',
    icon: Clock,
    color: 'text-odc-warning',
    bg: 'bg-odc-warning/10 ring-odc-warning/20',
  },
  EXCUSE: {
    label: 'Excusé',
    icon: AlertCircle,
    color: 'text-odc-muted',
    bg: 'bg-odc-surface-alt ring-odc-border',
  },
} as const;

const SESSION_STATUT_LABELS: Record<string, string> = {
  OUVERTE: 'Ouverte',
  FERMEE: 'Fermée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
  PLANIFIEE: 'Planifiée',
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  sessionId: string;
}

export function PresencesParticipantDetail({ sessionId }: Props) {
  const router = useRouter();

  /* ─── Query : détails de la session + présence du participant ─── */
  const { data, isLoading, isError, isFetching, refetch } =
    useQuery<ParticipantDetail>({
      queryKey: ['participant', 'presence', sessionId],
      queryFn: async () => {
        const { data } = await api.get(
          `/participant/presences/session/${sessionId}`,
        );
        return data.data;
      },
      enabled: !!sessionId,
    });

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU — Chargement
     ══════════════════════════════════════════════════════════════════════════ */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU — Erreur
     ══════════════════════════════════════════════════════════════════════════ */
  if (isError || !data) {
    return (
      <QueryErrorState
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        description="Impossible de charger les détails de cette session."
      />
    );
  }

  const { session, presence, inscription } = data;
  const statutConfig = presence
    ? STATUT_CONFIG[presence.statut as keyof typeof STATUT_CONFIG] ??
      STATUT_CONFIG.ABSENT
    : null;
  const StatutIcon = statutConfig?.icon;

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU PRINCIPAL
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ─── Retour ─── */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour à mes présences
      </Button>

      {/* ─── Header session ─── */}
      <Card variant="elevated" padding="lg" className="overflow-hidden">
        <span
          aria-hidden="true"
          className="from-odc-500 via-odc-600 to-odc-700 absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-odc-primary-soft text-odc-primary font-mono text-[11px]">
                {session.codeSession}
              </Badge>
              <Badge
                className={cn(
                  'ring-1',
                  session.statut === 'EN_COURS'
                    ? 'bg-odc-success/10 text-odc-success ring-odc-success/20'
                    : session.statut === 'TERMINEE'
                      ? 'bg-odc-surface-alt text-odc-muted ring-odc-border'
                      : 'bg-odc-primary/10 text-odc-primary ring-odc-primary/20',
                )}
              >
                {SESSION_STATUT_LABELS[session.statut] ?? session.statut}
              </Badge>
              {session.presenceOuverte && (
                <Badge className="bg-odc-success/10 text-odc-success ring-1 ring-odc-success/20">
                  <span className="bg-odc-success mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full" />
                  Présences ouvertes
                </Badge>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {session.formation?.titre ?? 'Session de formation'}
            </h1>

            {session.formation?.description && (
              <p className="text-odc-muted mt-2 text-sm leading-relaxed">
                {session.formation.description}
              </p>
            )}
          </div>
        </div>

        {/* ─── Infos session ─── */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile
            icon={Calendar}
            label="Date de début"
            value={formatDate(session.dateDebut)}
          />
          <InfoTile
            icon={Calendar}
            label="Date de fin"
            value={formatDate(session.dateFin)}
          />
          <InfoTile
            icon={MapPin}
            label="Lieu"
            value={session.lieu ?? 'En ligne'}
          />
          <InfoTile
            icon={Building2}
            label="Capacité"
            value={`${session.capacite ?? 0} places`}
          />
        </div>
      </Card>

      {/* ─── Statut de présence ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Carte statut */}
        <Card variant="elevated" padding="lg">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <User className="text-odc-primary h-5 w-5" />
            Ma présence
          </h2>

          {presence && statutConfig && StatutIcon ? (
            <div
              className={cn(
                'flex items-center gap-4 rounded-xl p-4 ring-1',
                statutConfig.bg,
              )}
            >
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/80',
                  statutConfig.color,
                )}
              >
                <StatutIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-lg font-bold',
                    statutConfig.color,
                  )}
                >
                  {statutConfig.label}
                </p>
                <p className="text-odc-muted mt-0.5 text-xs">
                  Enregistrée le{' '}
                  {presence.scanneLe
                    ? formatDateTime(presence.scanneLe)
                    : formatDate(presence.datePresence)}
                </p>
                {presence.methode && (
                  <p className="text-odc-muted mt-0.5 text-xs">
                    Méthode :{' '}
                    {presence.methode === 'QR_CODE'
                      ? 'Scan QR Code'
                      : 'Saisie manuelle'}
                  </p>
                )}
              </div>
            </div>
          ) : inscription?.statut === 'ACCEPTEE' ? (
            <div className="bg-odc-warning/5 ring-1 ring-odc-warning/20 flex flex-col items-center gap-3 rounded-xl p-6 text-center">
              <div className="bg-odc-warning/10 text-odc-warning flex h-14 w-14 items-center justify-center rounded-full">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <p className="text-odc-warning text-base font-semibold">
                  Présence non enregistrée
                </p>
                <p className="text-odc-muted mt-1 text-xs">
                  Scannez le QR code affiché par votre formateur pour
                  enregistrer votre présence.
                </p>
              </div>
              {session.presenceOuverte && (
                <Button
                  variant="brand"
                  onClick={() =>
                    router.push(
                      `/participant/presences/scanner?session=${sessionId}`,
                    )
                  }
                  leftIcon={<QrCode className="h-4 w-4" />}
                >
                  Scanner le QR code
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-odc-error/5 ring-1 ring-odc-error/20 flex flex-col items-center gap-2 rounded-xl p-6 text-center">
              <div className="bg-odc-error/10 text-odc-error flex h-12 w-12 items-center justify-center rounded-full">
                <XCircle className="h-6 w-6" />
              </div>
              <p className="text-odc-error text-sm font-semibold">
                Vous n'êtes pas inscrit à cette session
              </p>
            </div>
          )}
        </Card>

        {/* Carte formateur */}
        {session.formateur && (
          <Card variant="elevated" padding="lg">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <User className="text-odc-primary h-5 w-5" />
              Formateur
            </h2>
            <div className="flex items-center gap-4">
              <div className="from-odc-500 to-odc-700 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white">
                {(session.formateur.prenom?.[0] ?? '?').toUpperCase()}
                {(session.formateur.nom?.[0] ?? '').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {session.formateur.prenom} {session.formateur.nom}
                </p>
                <p className="text-odc-muted truncate text-xs">
                  {session.formateur.email}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ─── Timeline / informations ─── */}
      <Card variant="elevated" padding="lg">
        <h2 className="mb-4 text-base font-semibold">
          Informations complémentaires
        </h2>
        <div className="space-y-3">
          <DetailRow label="Code session" value={session.codeSession} mono />
          <DetailRow
            label="Statut de la session"
            value={SESSION_STATUT_LABELS[session.statut] ?? session.statut}
          />
          <DetailRow
            label="Présences"
            value={session.presenceOuverte ? 'Ouvertes' : 'Fermées'}
          />
          {presence?.heureScan && (
            <DetailRow label="Heure du scan" value={presence.heureScan} mono />
          )}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════════════════════════════════════ */

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-odc-surface-alt/40 ring-1 ring-odc-border/40 rounded-xl p-3">
      <div className="text-odc-muted mb-1 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-odc-text-primary truncate text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-odc-border/60 flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
      <span className="text-odc-muted text-xs font-medium">{label}</span>
      <span
        className={cn(
          'text-odc-text-primary text-sm',
          mono && 'font-mono text-xs',
        )}
      >
        {value}
      </span>
    </div>
  );
}