// src/app/(staff)/staff/presences/[sessionId]/components/PresencesTable.tsx
'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  QrCode,
  UserCheck,
  Users,
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
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Participant {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  photoUrl?: string | null;   // ⭐ photo du participant
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
    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  ABSENT:
    'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  RETARD:
    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  EXCUSE:
    'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  NON_MARQUEE:
    'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const METHODE_ICONS: Record<string, React.ElementType> = {
  QR_CODE: QrCode,
  MANUEL: UserCheck,
};

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR PARTICIPANT (image + fallback)
   ═══════════════════════════════════════════════════════════════════════════ */

function ParticipantAvatar({
  prenom,
  nom,
  photoUrl,
}: {
  prenom?: string | null;
  nom?: string | null;
  photoUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);

  const initials =
    `${prenom?.[0] ?? '?'}${nom?.[0] ?? ''}`.toUpperCase() || '?';

  const src = !imageError && photoUrl ? getMediaUrl(photoUrl) : null;

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-semibold text-white ring-2 ring-white dark:ring-slate-900">
      {src ? (
        <img
          src={src}
          alt={`${prenom ?? ''} ${nom ?? ''}`.trim() || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
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
        p != null && typeof p.id === 'string' && p.id.length > 0,
    );

    const safePresences = (presences ?? []).filter(
      (p): p is Presence => p != null && typeof p.participantId === 'string',
    );

    return safeParticipants.map((participant) => {
      const presence = safePresences.find((item) => item.participantId === participant.id);
      return {
        id: presence?.id ?? `participant-${participant.id}`,
        participantId: participant.id,
        participant: presence?.participant ?? participant,
        present: presence?.present ?? false,
        statut: presence?.statut ?? 'NON_MARQUEE',
        scanneLe: presence?.scanneLe,
        methode: presence?.methode,
      };
    });
  }, [participants, presences]);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun participant inscrit"
        description="Les participants ayant une inscription acceptée apparaîtront ici."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-200 dark:border-slate-800">
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
          const MethodeIcon = row.methode ? METHODE_ICONS[row.methode] ?? QrCode : null;
          const participant = row.participant;
          const isPending =
            mutation.isPending &&
            mutation.variables?.participantId === row.participantId;

          return (
            <TableRow
              key={row.id}
              className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <TableCell>
                <div className="flex items-center gap-2.5">
                  {/* ⭐ Avatar avec photo */}
                  <ParticipantAvatar
                    prenom={participant?.prenom}
                    nom={participant?.nom}
                    photoUrl={participant?.photoUrl}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                      {participant?.prenom ?? ''} {participant?.nom ?? ''}
                    </p>
                    {participant?.email && (
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {participant.email}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

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

              <TableCell className="hidden md:table-cell">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {MethodeIcon && <MethodeIcon className="h-3.5 w-3.5" aria-hidden />}
                  {row.methode === 'QR_CODE'
                    ? 'QR Code'
                    : row.methode === 'MANUEL'
                      ? 'Manuel'
                      : '—'}
                </span>
              </TableCell>

              <TableCell className="hidden text-xs text-slate-500 dark:text-slate-400 lg:table-cell">
                {row.scanneLe ? (
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <Calendar className="h-3 w-3" aria-hidden />
                    {formatDateTime(row.scanneLe)}
                  </span>
                ) : (
                  '—'
                )}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() =>
                    mutation.mutate({
                      participantId: row.participantId,
                      present: !row.present,
                    })
                  }
                  disabled={isPending}
                  className={cn(
                    'h-8 rounded-lg px-3 font-medium',
                    row.present
                      ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                  )}
                >
                  {isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : row.present ? (
                    <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  )}
                  {row.present ? 'Absent' : 'Présent'}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}