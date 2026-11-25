// src/app/(formateur)/formateur/presences/[sessionId]/components/PresencesTable.tsx
'use client';

import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  QrCode,
  UserCheck,
  Loader2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { ParticipantAvatar } from '@/components/shared/ParticipantAvatar';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Participant {
  id: string;
  prenom?: string;
  nom?: string;
  email?: string;
  photoUrl?: string | null;
}

interface Presence {
  id: string;
  participantId: string;
  statut: string;
  methode?: string;
  scanneLe?: string;
  present?: boolean;
  participant?: Participant;
}

interface Props {
  sessionId: string;
  presences: Presence[] | null | undefined;
  participants: Participant[] | null | undefined;
  onRefresh: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_LABELS: Record<string, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  RETARD: 'Retard',
  EXCUSE: 'Excusé',
  NON_MARQUEE: 'À marquer',
};

const STATUT_COLORS: Record<string, string> = {
  PRESENT:
    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  ABSENT:
    'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
  RETARD:
    'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  EXCUSE:
    'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  NON_MARQUEE:
    'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PresencesTable({ sessionId, presences, participants, onRefresh }: Props) {
  const mutation = useMutation({
    mutationFn: async (payload: { participantId: string; present: boolean }) => {
      await api.post('/presences/manuel', {
        sessionId,
        participantId: payload.participantId,
        present: payload.present,
      });
    },
    onSuccess: () => {
      toast.success('Présence mise à jour');
      onRefresh();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const rows = useMemo(() => {
    const safeParticipants = (participants ?? []).filter(
      (p): p is Participant =>
        p !== null && p !== undefined && typeof p.id === 'string' && p.id.length > 0,
    );

    const safePresences = (presences ?? []).filter(
      (p): p is Presence =>
        p !== null && p !== undefined && typeof p.participantId === 'string',
    );

    return safeParticipants.map((participant) => {
      const presence = safePresences.find((item) => item.participantId === participant.id);
      return {
        id: presence?.id ?? `p-${participant.id}`,
        participantId: participant.id,
        participant: presence?.participant ?? participant,
        present: presence?.present ?? false,
        statut: presence?.statut ?? 'NON_MARQUEE',
        scanneLe: presence?.scanneLe,
        methode: presence?.methode,
      };
    });
  }, [participants, presences]);

  /* ── Aucun participant ──────────────────────────────── */
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Aucun participant inscrit"
        description="Les participants ayant une inscription acceptée apparaîtront ici."
      />
    );
  }

  /* ── Tableau ────────────────────────────────────────── */
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
            <TableHead className="text-slate-700 dark:text-slate-300">Participant</TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300">Statut</TableHead>
            <TableHead className="hidden text-slate-700 dark:text-slate-300 md:table-cell">
              Méthode
            </TableHead>
            <TableHead className="hidden text-slate-700 dark:text-slate-300 lg:table-cell">
              Scanné le
            </TableHead>
            <TableHead className="text-right text-slate-700 dark:text-slate-300">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const p = row.participant;
            const isRowLoading = mutation.isPending && mutation.variables?.participantId === row.participantId;

            return (
              <TableRow
                key={row.id}
                className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                {/* Participant + avatar photo */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ParticipantAvatar
                      prenom={p?.prenom}
                      nom={p?.nom}
                      photoUrl={p?.photoUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                        {p?.prenom ?? ''} {p?.nom ?? ''}
                      </p>
                      {p?.email && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {p.email}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Statut */}
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      STATUT_COLORS[row.statut] ?? STATUT_COLORS.NON_MARQUEE,
                    )}
                  >
                    {STATUT_LABELS[row.statut] ?? 'À marquer'}
                  </span>
                </TableCell>

                {/* Méthode */}
                <TableCell className="hidden md:table-cell">
                  {row.methode === 'QR_CODE' ? (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <QrCode className="h-3.5 w-3.5" aria-hidden />
                      QR Code
                    </span>
                  ) : row.methode === 'MANUEL' ? (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <UserCheck className="h-3.5 w-3.5" aria-hidden />
                      Manuel
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                  )}
                </TableCell>

                {/* Date scan */}
                <TableCell className="hidden text-xs text-slate-500 dark:text-slate-400 lg:table-cell">
                  {row.scanneLe ? (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" aria-hidden />
                      {formatDateTime(row.scanneLe)}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>

                {/* Action */}
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      mutation.mutate({
                        participantId: row.participantId,
                        present: !row.present,
                      })
                    }
                    disabled={isRowLoading}
                    className={cn(
                      'h-8 gap-1.5 rounded-full px-3 text-xs font-semibold shadow-sm transition-all duration-200',
                      row.present
                        ? 'border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30'
                        : 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                    )}
                  >
                    {isRowLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : row.present ? (
                      <>
                        <XCircle className="h-3.5 w-3.5" aria-hidden />
                        Marquer absent
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Marquer présent
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}