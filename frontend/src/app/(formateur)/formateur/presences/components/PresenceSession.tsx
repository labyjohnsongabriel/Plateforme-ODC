// src/app/(formateur)/formateur/presences/[sessionId]/components/PresenceSession.tsx
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  Clock,
  Percent,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { QrGenerator } from './QrGenerator';
import { PresencesTable } from './PresencesTable';
import { ManualPresence } from './ManualPresence';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  sessionId: string;
}

type StatColor = 'success' | 'error' | 'warning' | 'primary' | 'info';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: StatColor;
}

function toSafeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value.filter((v) => v != null) as T[];
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════════════════════ */

const STAT_COLORS: Record<StatColor, string> = {
  success:
    'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
  error:
    'bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
  warning:
    'bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
  primary:
    'bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30',
  info:
    'bg-sky-50 text-sky-600 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/30',
};

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardContent className="p-5">
        <div
          className={cn(
            'mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
            STAT_COLORS[color],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <p className="font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
          {value}
        </p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function PresenceSession({ sessionId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();

  /* ── Queries ────────────────────────────────────────── */
  const sessionQuery = useQuery({
    queryKey: ['formateur', 'session', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/sessions/${sessionId}`);
      return data?.data ?? null;
    },
    enabled: !!sessionId,
  });

  const participantsQuery = useQuery({
    queryKey: ['formateur', 'session', sessionId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(
        `/formateur/sessions/${sessionId}/participants`,
      );
      return toSafeArray(data?.data);
    },
    enabled: !!sessionId,
  });

  const presencesQuery = useQuery({
    queryKey: ['formateur', 'presences', sessionId],
    queryFn: async () => {
      const { data } = await api.get(
        `/formateur/presences/session/${sessionId}`,
        { params: { limit: 200 } },
      );
      return toSafeArray(data?.data);
    },
    enabled: !!sessionId,
  });

  /* ── Export PDF ─────────────────────────────────────── */
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(
        `/admin/exports/session/${sessionId}/pdf`,
        { responseType: 'blob' },
      );
      return response.data;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presences-${sessionQuery.data?.codeSession ?? sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ── Données ────────────────────────────────────────── */
  const session = sessionQuery.data;
  const participants = participantsQuery.data ?? [];
  const presences = presencesQuery.data ?? [];
  const isLoading = presencesQuery.isLoading || participantsQuery.isLoading;

  /* ── Stats calculées ────────────────────────────────── */
  const stats = useMemo(() => {
    const totalInscrits = participants.length;
    const presents = presences.filter((p: any) => p?.present === true).length;
    const absents = presences.filter((p: any) => p?.present === false).length;
    const aMarquer = Math.max(totalInscrits - presents - absents, 0);
    const taux = totalInscrits > 0 ? Math.round((presents / totalInscrits) * 100) : 0;
    return { totalInscrits, presents, absents, aMarquer, taux };
  }, [participants, presences]);

  /* ── Erreur ─────────────────────────────────────────── */
  if (sessionQuery.isError || participantsQuery.isError || presencesQuery.isError) {
    return (
      <QueryErrorState
        onRetry={() =>
          void Promise.all([
            sessionQuery.refetch(),
            participantsQuery.refetch(),
            presencesQuery.refetch(),
          ])
        }
        isRetrying={
          sessionQuery.isFetching ||
          participantsQuery.isFetching ||
          presencesQuery.isFetching
        }
        description="Impossible de charger cette feuille de présence. Vérifiez vos droits et réessayez."
      />
    );
  }

  /* ── Rendu ──────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Retour */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
        Retour
      </Button>

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
            Feuille de présence
          </h1>
          {session && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-mono">{session.codeSession}</span> —{' '}
              {session.formation?.titre ?? 'Formation'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              qc.invalidateQueries({
                queryKey: ['formateur', 'presences', sessionId],
              })
            }
            disabled={presencesQuery.isFetching}
            className="h-9 rounded-lg"
          >
            <RefreshCw
              className={cn(
                'mr-2 h-4 w-4',
                presencesQuery.isFetching && 'animate-spin',
              )}
              aria-hidden
            />
            Rafraîchir
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="h-9 rounded-lg"
          >
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="mr-2 h-4 w-4" aria-hidden />
            )}
            Export PDF
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Inscrits" value={stats.totalInscrits} icon={Users} color="primary" />
        <StatCard label="Présents" value={stats.presents} icon={UserCheck} color="success" />
        <StatCard label="Absents" value={stats.absents} icon={UserX} color="error" />
        <StatCard label="À marquer" value={stats.aMarquer} icon={Clock} color="warning" />
        <StatCard label="Taux" value={`${stats.taux}%`} icon={Percent} color="info" />
      </div>

      {/* QR + Table */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <QrGenerator sessionId={sessionId} session={session ?? undefined} />
          <ManualPresence sessionId={sessionId} />
        </div>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-50">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : (
              <PresencesTable
                sessionId={sessionId}
                presences={presences}
                participants={participants}
                onRefresh={() =>
                  qc.invalidateQueries({
                    queryKey: ['formateur', 'presences', sessionId],
                  })
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}