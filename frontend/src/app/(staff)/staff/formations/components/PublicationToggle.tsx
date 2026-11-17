// src/app/(staff)/staff/formations/components/PublicationToggle.tsx
'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

interface Props {
  formationId: string;
  estPubliee: boolean;
  onToggle?: () => void;
}

export function PublicationToggle({ formationId, estPubliee, onToggle }: Props) {
  const mutation = useMutation({
    mutationFn: async () => {
      await api.put(`/staff/formations/${formationId}/publier`, {
        estPubliee: !estPubliee,
      });
    },
    onSuccess: () => {
      toast.success(estPubliee ? 'Formation dépubliée' : 'Formation publiée');
      onToggle?.();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const isPending = mutation.isPending;

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-1 rounded-full transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isPending && 'cursor-wait opacity-60',
      )}
      aria-label={
        isPending
          ? 'Mise à jour en cours'
          : estPubliee
            ? 'Dépublier la formation'
            : 'Publier la formation'
      }
      title={estPubliee ? 'Dépublier' : 'Publier'}
      aria-busy={isPending}
    >
      {isPending ? (
        <Badge
          variant="outline"
          className="gap-1 border-primary/30 text-primary"
        >
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Mise à jour…
        </Badge>
      ) : estPubliee ? (
        <Badge className="cursor-pointer gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20">
          <Eye className="h-3 w-3" aria-hidden="true" />
          Publiée
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="cursor-pointer gap-1 border-border text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <EyeOff className="h-3 w-3" aria-hidden="true" />
          Brouillon
        </Badge>
      )}
    </button>
  );
}