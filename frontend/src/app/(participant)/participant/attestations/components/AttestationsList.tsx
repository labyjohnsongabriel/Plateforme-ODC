'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Award, Download, Calendar, CheckCircle2, ExternalLink, Hash,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

export function AttestationsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'attestations'],
    queryFn: async () => {
      const { data } = await api.get('/participant/attestations');
      return data.data;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/participant/attestations/${id}/telecharger`, {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob, id) => {
      const att = data?.find((a: any) => a.id === id);
      const url = URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation-${att?.numero ?? id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Téléchargement démarré');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  const attestations = data ?? [];

  if (!attestations.length) {
    return (
      <Card>
        <EmptyState
          icon={Award}
          title="Aucune attestation"
          description="Vos attestations apparaîtront ici dès que vous aurez validé une formation."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {attestations.map((a: any) => (
        <Card
          key={a.id}
          className="overflow-hidden hover:shadow-odc-lg transition-all group"
        >
          {/* Bandeau supérieur */}
          <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-700" />

          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold line-clamp-2 group-hover:text-odc-primary transition-colors">
                  {a.session?.formation?.titre}
                </h3>
                <p className="text-xs text-odc-muted font-mono mt-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {a.numero}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="p-2 rounded-lg bg-odc-surface-alt">
                <p className="text-odc-muted">Note finale</p>
                <p className="font-display font-bold text-lg text-odc-primary">
                  {a.noteFinale ?? '—'}/20
                </p>
              </div>
              <div className="p-2 rounded-lg bg-odc-surface-alt">
                <p className="text-odc-muted">Présence</p>
                <p className="font-display font-bold text-lg text-odc-success">
                  {a.tauxPresence ?? 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-odc-muted mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {formatDate(a.dateEmission)}
              </span>
              {a.valide && (
                <Badge className="bg-odc-success-bg text-odc-success text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valide
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="odc"
                size="sm"
                className="flex-1"
                onClick={() => downloadMutation.mutate(a.id)}
                disabled={downloadMutation.isPending}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Télécharger
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href={`/verifier-attestation/${a.numero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Vérifier"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}