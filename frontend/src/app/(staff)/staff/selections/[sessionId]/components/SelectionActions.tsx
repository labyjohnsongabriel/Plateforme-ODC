// src/app/(staff)/staff/selections/[sessionId]/components/SelectionActions.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  ListChecks,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type SelectionStatus = 'ACCEPTEE' | 'REFUSEE' | 'LISTE_ATTENTE';

interface SelectionActionsProps {
  sessionId: string;
  selected: string[];
  onDone: () => void;
  onClear?: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SelectionActions({
  sessionId,
  selected,
  onDone,
  onClear,
}: SelectionActionsProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (statut: SelectionStatus) => {
      await api.post(
        `/staff/selections/session/${sessionId}/selectionner`,
        { inscriptionIds: selected, statut },
      );
      return statut;
    },
    onSuccess: (statut) => {
      const labels: Record<SelectionStatus, string> = {
        ACCEPTEE: 'candidat(s) accepté(s)',
        REFUSEE: 'candidat(s) refusé(s)',
        LISTE_ATTENTE: "candidat(s) placé(s) en liste d'attente",
      };
      toast.success(`${selected.length} ${labels[statut]}`);
      onDone();
      queryClient.invalidateQueries({
        queryKey: ['staff', 'selection', sessionId],
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const count = selected.length;
  const isPending = mutation.isPending;

  return (
    <Card
      className={cn(
        'border-slate-200 bg-slate-50 ring-1 ring-slate-200',
        'dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        {/* Compteur */}
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              'rounded-full bg-slate-900 px-2.5 font-mono text-xs tabular-nums text-white',
              'dark:bg-slate-50 dark:text-slate-900',
            )}
          >
            {count}
          </Badge>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            candidat{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={isPending}
              className={cn(
                'h-8 rounded-lg font-medium',
                'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
              )}
            >
              <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Tout désélectionner
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => mutation.mutate('LISTE_ATTENTE')}
            disabled={isPending}
            className={cn(
              'h-8 rounded-lg border-slate-200 bg-white font-medium',
              'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            )}
          >
            {isPending && mutation.variables === 'LISTE_ATTENTE' ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <ListChecks className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            )}
            Liste d&apos;attente
          </Button>

          <Button
            size="sm"
            onClick={() => mutation.mutate('REFUSEE')}
            disabled={isPending}
            className={cn(
              'h-8 rounded-lg font-medium text-white',
              'bg-red-600 hover:bg-red-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
            )}
          >
            {isPending && mutation.variables === 'REFUSEE' ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            )}
            Refuser
          </Button>

          <Button
            size="sm"
            onClick={() => mutation.mutate('ACCEPTEE')}
            disabled={isPending}
            className={cn(
              'h-8 rounded-lg font-medium',
              'bg-slate-900 text-white hover:bg-slate-800',
              'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            )}
          >
            {isPending && mutation.variables === 'ACCEPTEE' ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            )}
            Accepter
          </Button>
        </div>
      </div>
    </Card>
  );
}