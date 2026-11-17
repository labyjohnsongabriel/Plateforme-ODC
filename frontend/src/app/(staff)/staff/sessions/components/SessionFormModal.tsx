// src/app/(staff)/staff/sessions/components/SessionFormModal.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { SessionForm, type SessionFormValues } from './SessionForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string | null;
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function toDateTimeInput(value?: string | null): string {
  if (!value) return '';
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export function SessionFormModal({ open, onOpenChange, sessionId }: Props) {
  const qc = useQueryClient();
  const isEdit = Boolean(sessionId);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['staff', 'session', sessionId],
    queryFn: async () => {
      const response = await api.get(`/staff/sessions/${sessionId}`);
      return response.data?.data ?? response.data;
    },
    enabled: open && isEdit,
  });

  const mutation = useMutation({
    mutationFn: async (values: SessionFormValues) => {
      const payload = {
        ...values,
        formateurId: values.formateurId || undefined,
        codeSession: values.codeSession || undefined,
        lieu: values.lieu || null,
        lienVisio: values.lienVisio || null,
        notes: values.notes || null,
        dateOuvertureInscriptions: values.dateOuvertureInscriptions || undefined,
        dateFermetureInscriptions: values.dateFermetureInscriptions || undefined,
      };

      if (isEdit && sessionId) {
        const { data } = await api.put(`/staff/sessions/${sessionId}`, payload);
        return data?.data ?? data;
      } else {
        const { data } = await api.post('/staff/sessions', payload);
        return data?.data ?? data;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Session modifiée' : 'Session créée');
      qc.invalidateQueries({ queryKey: ['staff', 'sessions'] });
      qc.invalidateQueries({ queryKey: ['staff', 'session', sessionId] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const defaultValues: Partial<SessionFormValues> | undefined =
    isEdit && session
      ? {
          formationId: session.formationId ?? session.formation?.id ?? '',
          formateurId: session.formateurId ?? session.formateur?.id ?? '',
          codeSession: session.codeSession ?? '',
          dateDebut: toDateInput(session.dateDebut),
          dateFin: toDateInput(session.dateFin),
          lieu: session.lieu ?? '',
          lienVisio: session.lienVisio ?? '',
          capacite: Number(session.capacite ?? 30),
          statut: session.statut ?? 'PLANIFIEE',
          notes: session.notes ?? '',
          estPubliee: session.estPubliee ?? true,
          dateOuvertureInscriptions: toDateTimeInput(session.dateOuvertureInscriptions),
          dateFermetureInscriptions: toDateTimeInput(session.dateFermetureInscriptions),
        }
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier la session' : 'Créer une nouvelle session'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifiez les informations de la session.'
              : 'Remplissez les informations pour planifier une session.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && sessionLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : (
          <SessionForm
            mode={isEdit ? 'edit' : 'create'}
            defaultValues={defaultValues}
            onSubmit={(values) => mutation.mutate(values)}
            onCancel={() => onOpenChange(false)}
            isPending={mutation.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}