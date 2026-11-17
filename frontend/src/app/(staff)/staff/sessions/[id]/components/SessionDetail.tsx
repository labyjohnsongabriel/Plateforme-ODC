// src/app/(staff)/staff/sessions/[id]/components/SessionDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  QrCode,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  UserCheck,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { SessionFormModal } from '../../components/SessionFormModal';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Session {
  id: string;
  codeSession?: string;
  dateDebut?: string;
  dateFin?: string;
  lieu?: string | null;
  capacite?: number;
  statut?: string;
  presenceOuverte?: boolean;
  lienVisio?: string | null;
  notes?: string | null;
  inscriptionsCount?: number;
  estPubliee?: boolean;
  formation?: { id?: string; titre?: string } | null;
  formateur?: { id?: string; prenom?: string; nom?: string; email?: string } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  PLANIFIEE: {
    label: 'Planifiée',
    icon: Clock,
    className:
      'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  },
  OUVERTE: {
    label: 'Ouverte',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  EN_COURS: {
    label: 'En cours',
    icon: PlayCircle,
    className:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  TERMINEE: {
    label: 'Terminée',
    icon: CheckCircle2,
    className: 'bg-muted text-muted-foreground border border-border',
  },
  ANNULEE: {
    label: 'Annulée',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function formatDate(value?: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function extractSession(response: unknown): Session | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;
  const s = (root.session ?? root) as Session;
  return s?.id ? s : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  /* ─── Query session ─── */
  const { data: session, isLoading, isError, refetch, isFetching } = useQuery<Session | null>({
    queryKey: ['staff', 'session', sessionId],
    queryFn: async () => {
      const response = await api.get(`/staff/sessions/${sessionId}`);
      return extractSession(response.data);
    },
    enabled: !!sessionId,
  });

  /* ─── Mutation delete ─── */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/staff/sessions/${sessionId}`);
    },
    onSuccess: () => {
      toast.success('Session supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'sessions'] });
      router.push('/staff/sessions');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Mutation toggle présence ─── */
  const togglePresenceMutation = useMutation({
    mutationFn: async (ouverte: boolean) => {
      await api.put(`/staff/sessions/${sessionId}/ouvrir-presence`, { ouverte });
    },
    onSuccess: (_, ouverte) => {
      toast.success(ouverte ? 'Présences ouvertes' : 'Présences fermées');
      qc.invalidateQueries({ queryKey: ['staff', 'session', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError || !session) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour
        </Button>
        <Card>
          <CardContent className="p-6">
            <QueryErrorState
              onRetry={() => void refetch()}
              isRetrying={isFetching}
              description="Cette session n'existe pas ou n'est pas accessible."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Rendu ─── */
  const config = session.statut
    ? STATUT_CONFIG[session.statut] ?? STATUT_CONFIG.PLANIFIEE
    : STATUT_CONFIG.PLANIFIEE;
  const StatusIcon = config.icon;
  const inscrits = session.inscriptionsCount ?? 0;
  const capacite = session.capacite ?? 0;
  const ratio = capacite > 0 ? inscrits / capacite : 0;
  const placesRestantes = Math.max(capacite - inscrits, 0);

  return (
    <div className="space-y-6">
      {/* Retour */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Retour
      </Button>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20">
            <Calendar
              className="h-6 w-6 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {session.formation?.titre ?? 'Session'}
              </h1>
              <Badge
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold',
                  config.className,
                )}
              >
                <StatusIcon className="h-3 w-3" aria-hidden="true" />
                {config.label}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {session.codeSession ?? '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Modifier */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Modifier
          </Button>

          {/* Supprimer */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  `Supprimer définitivement la session "${session.codeSession ?? 'cette session'}" ?`,
                )
              ) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Supprimer
          </Button>
        </div>
      </header>

      {/* Grille : main + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ─── Colonne principale ─── */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Présences */}
                <Button
                  asChild
                  className="justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={`/staff/presences/${session.id}`}>
                    <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                    Gérer les présences
                  </Link>
                </Button>

                {/* Toggle présence */}
                <Button
                  variant={session.presenceOuverte ? 'destructive' : 'outline'}
                  onClick={() =>
                    togglePresenceMutation.mutate(!session.presenceOuverte)
                  }
                  disabled={togglePresenceMutation.isPending}
                  className="justify-start"
                >
                  {togglePresenceMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {session.presenceOuverte ? 'Fermer les présences' : 'Ouvrir les présences'}
                </Button>

                {/* Candidats */}
                <Button variant="outline" asChild className="justify-start">
                  <Link href={`/staff/selections/${session.id}`}>
                    <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                    Gérer les candidats
                  </Link>
                </Button>

                {/* Détails de la formation */}
                {session.formation?.id && (
                  <Button variant="outline" asChild className="justify-start">
                    <Link href={`/staff/formations/${session.formation.id}`}>
                      <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                      Voir la formation
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={Calendar}
                  label="Date de début"
                  value={formatDate(session.dateDebut)}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date de fin"
                  value={formatDate(session.dateFin)}
                />
                <InfoItem
                  icon={MapPin}
                  label="Lieu"
                  value={session.lieu || 'En ligne'}
                />
                <InfoItem
                  icon={Users}
                  label="Capacité"
                  value={`${capacite} places`}
                />
                {session.formateur && (
                  <InfoItem
                    icon={UserCheck}
                    label="Formateur"
                    value={`${session.formateur.prenom ?? ''} ${session.formateur.nom ?? ''}`.trim() || '—'}
                  />
                )}
              </div>

              {/* Lien visio */}
              {session.lienVisio && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Video
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    <a
                      href={session.lienVisio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      Rejoindre la visioconférence
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </>
              )}

              {/* Notes internes */}
              {session.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Notes internes
                    </p>
                    <p className="whitespace-pre-line text-sm text-foreground">
                      {session.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Sidebar ─── */}
        <aside className="space-y-4">
          {/* Inscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inscriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chiffres */}
              <div className="flex items-baseline gap-2">
                <p className="font-display text-4xl font-bold tabular-nums text-foreground">
                  {inscrits}
                </p>
                <span className="text-sm text-muted-foreground">
                  / {capacite} places
                </span>
              </div>

              {/* Barre de remplissage */}
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                      ratio >= 1
                        ? 'from-emerald-400 to-emerald-600'
                        : ratio >= 0.8
                          ? 'from-amber-400 to-amber-600'
                          : 'from-primary to-primary/60',
                    )}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(ratio * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Taux de remplissage"
                  />
                </div>
                <p className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {Math.round(ratio * 100)}% rempli
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      placesRestantes > 0
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-destructive',
                    )}
                  >
                    {placesRestantes > 0
                      ? `${placesRestantes} place${placesRestantes > 1 ? 's' : ''} restante${placesRestantes > 1 ? 's' : ''}`
                      : 'Complet'}
                  </span>
                </p>
              </div>

              <Separator />

              {/* Statut présence */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Présences
                </span>
                {session.presenceOuverte ? (
                  <Badge className="gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                    Ouvertes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Fermées
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statut publication */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Publication
                </span>
                <Badge
                  variant={session.estPubliee ? 'default' : 'outline'}
                  className={
                    session.estPubliee
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'text-muted-foreground'
                  }
                >
                  {session.estPubliee ? 'Publiée' : 'Brouillon'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Modal édition */}
      <SessionFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        sessionId={editOpen ? sessionId : null}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 dark:bg-primary/15">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}