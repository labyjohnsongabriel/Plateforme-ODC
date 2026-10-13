'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

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

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="inline-flex"
      title={estPubliee ? 'Dépublier' : 'Publier'}
    >
      {estPubliee ? (
        <Badge className="bg-odc-success-bg text-odc-success hover:bg-odc-success-bg cursor-pointer">
          <Eye className="h-3 w-3 mr-1" />
          Publiée
        </Badge>
      ) : (
        <Badge variant="outline" className="cursor-pointer">
          <EyeOff className="h-3 w-3 mr-1" />
          Brouillon
        </Badge>
      )}
    </button>
  );
}