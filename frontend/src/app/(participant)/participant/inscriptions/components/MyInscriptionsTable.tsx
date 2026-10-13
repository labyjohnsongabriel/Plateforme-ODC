'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar, MapPin, Trash2, ArrowRight, FileText, Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { InscriptionStatusBadge } from './InscriptionStatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

export function MyInscriptionsTable() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'inscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/participant/inscriptions');
      return data.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/participant/inscriptions/${id}`);
    },
    onSuccess: () => {
      toast.success('Inscription annulée');
      qc.invalidateQueries({ queryKey: ['participant', 'inscriptions'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const inscriptions = data ?? [];

  if (!inscriptions.length) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="Aucune inscription"
          description="Vous n'avez pas encore postulé à une session."
          action={
            <Button variant="odc" asChild>
              <Link href="/formations">Découvrir les formations</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inscriptions.map((i: any) => {
        const canCancel = ['EN_ATTENTE', 'LISTE_ATTENTE'].includes(i.statut);
        const daysUntil = Math.ceil(
          (new Date(i.session?.dateDebut).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        return (
          <Card
            key={i.id}
            className="hover:shadow-odc-md transition-shadow overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-odc-500 to-odc-700" />

            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <InscriptionStatusBadge statut={i.statut} />
                    <span className="text-xs text-odc-muted font-mono">
                      {i.session?.codeSession}
                    </span>
                    {daysUntil > 0 && daysUntil <= 7 && (
                      <Badge className="bg-odc-warning-bg text-odc-warning text-xs">
                        Début dans {daysUntil}j
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-2">
                    {i.session?.formation?.titre}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-odc-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-odc-primary" />
                      {formatDate(i.session?.dateDebut)} → {formatDate(i.session?.dateFin)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-odc-primary" />
                      {i.session?.lieu || 'En ligne'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-odc-primary" />
                      {i.session?.capacite} places
                    </span>
                  </div>

                  {i.motifRefus && (
                    <div className="mt-2 p-2 rounded bg-odc-error-bg text-xs text-odc-error">
                      <strong>Motif du refus :</strong> {i.motifRefus}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/formations/${i.session?.formation?.slug}`}>
                      Voir la formation <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </Button>
                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-odc-error hover:bg-odc-error-bg hover:text-odc-error"
                      onClick={() => {
                        if (confirm('Annuler cette inscription ?')) {
                          cancelMutation.mutate(i.id);
                        }
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}