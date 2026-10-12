'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

const STATUT_COLORS: Record<string, string> = {
  PRESENT: 'bg-odc-success-bg text-odc-success',
  ABSENT: 'bg-odc-error-bg text-odc-error',
  RETARD: 'bg-odc-warning-bg text-odc-warning',
  EXCUSE: 'bg-odc-surface-alt text-odc-muted',
};

interface Props {
  sessionId: string;
  presences: any[];
  onRefresh: () => void;
}

export function PresencesTable({ sessionId, presences, onRefresh }: Props) {
  const mutation = useMutation({
    mutationFn: async (payload: { participantId: string; present: boolean }) => {
      await api.post('/staff/presences/manuelle', {
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

  if (!presences.length) {
    return <EmptyState icon={CheckCircle2} title="Aucune présence" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Participant</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="hidden md:table-cell">Scanné le</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {presences.map((p: any) => (
          <TableRow key={p.id}>
            <TableCell>
              <p className="font-medium text-sm">
                {p.participant?.prenom} {p.participant?.nom}
              </p>
              <p className="text-xs text-odc-muted">{p.participant?.email}</p>
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[p.statut]}`}>
                {p.statut}
              </span>
            </TableCell>
            <TableCell className="hidden md:table-cell text-xs text-odc-muted">
              {p.scanneLe ? formatDateTime(p.scanneLe) : '—'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  mutation.mutate({ participantId: p.participantId, present: !p.present })
                }
                disabled={mutation.isPending}
              >
                {p.present ? (
                  <><XCircle className="h-3.5 w-3.5 mr-1.5" /> Marquer absent</>
                ) : (
                  <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Marquer présent</>
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}