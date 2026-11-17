// src/app/(participant)/participant/inscriptions/components/MyInscriptionsTable.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar, MapPin, Trash2, ArrowRight, FileText, Users, Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InscriptionStatusBadge } from './InscriptionStatusBadge';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Inscription {
  id: string;
  statut: string;
  dateInscription?: string;
  motifRefus?: string | null;
  session?: {
    id: string;
    codeSession?: string;
    dateDebut?: string;
    dateFin?: string;
    lieu?: string | null;
    capacite?: number;
    formation?: {
      id?: string;
      titre?: string;
      slug?: string;
    } | null;
  } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function MyInscriptionsTable() {
  const qc = useQueryClient();
  const [toCancel, setToCancel] = useState<Inscription | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<Inscription[]>({
    queryKey: ['participant', 'inscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/participant/inscriptions');
      const root = data?.data ?? data;

      // ⭐ Lit { inscriptions: [...] } OU un tableau direct
      if (Array.isArray(root)) return root;
      if (Array.isArray(root?.inscriptions)) return root.inscriptions;
      return [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/participant/inscriptions/${id}`);
    },
    onSuccess: () => {
      toast.success('Inscription annulée');
      qc.invalidateQueries({ queryKey: ['participant', 'inscriptions'] });
      setToCancel(null);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            Impossible de charger vos inscriptions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="mt-3 h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const inscriptions = data ?? [];

  /* ── Vide ───────────────────────────────────────────── */
  if (!inscriptions.length) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          icon={FileText}
          title="Aucune inscription"
          description="Vous n'avez pas encore postulé à une session."
          action={
            <Button variant="primary" size="md" asChild>
              <Link href="/formations">Découvrir les formations</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  /* ── Rendu principal ────────────────────────────────── */
  return (
    <>
      <div className="space-y-4">
        {inscriptions.map((i) => {
          const canCancel = ['EN_ATTENTE', 'LISTE_ATTENTE'].includes(i.statut);

          const dateDebut = i.session?.dateDebut
            ? new Date(i.session.dateDebut)
            : null;
          const daysUntil = dateDebut
            ? Math.ceil((dateDebut.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;

          const isUpcoming = daysUntil !== null && daysUntil > 0 && daysUntil <= 7;

          return (
            <Card
              key={i.id}
              className={cn(
                'overflow-hidden transition-shadow',
                'border-slate-200 bg-white hover:shadow-md',
                'dark:border-slate-800 dark:bg-slate-950 dark:hover:shadow-lg dark:hover:shadow-slate-900/50',
              )}
            >
              {/* Bandeau orange */}
              <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-700" />

              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-[240px] flex-1">
                    {/* Statut + code + badge urgence */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <InscriptionStatusBadge statut={i.statut} />

                      {i.session?.codeSession && (
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {i.session.codeSession}
                        </span>
                      )}

                      {isUpcoming && (
                        <Badge className="border border-amber-200 bg-amber-50 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                          <Clock className="mr-1 h-3 w-3" aria-hidden />
                          Début dans {daysUntil}j
                        </Badge>
                      )}
                    </div>

                    {/* Titre formation */}
                    <h3 className="mb-2 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {i.session?.formation?.titre ?? 'Formation'}
                    </h3>

                    {/* Métadonnées */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                      {i.session?.dateDebut && (
                        <span className="flex items-center gap-1.5">
                          <Calendar
                            className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400"
                            aria-hidden
                          />
                          {formatDate(i.session.dateDebut)}
                          {i.session.dateFin && ` → ${formatDate(i.session.dateFin)}`}
                        </span>
                      )}

                      <span className="flex items-center gap-1.5">
                        <MapPin
                          className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400"
                          aria-hidden
                        />
                        {i.session?.lieu || 'En ligne'}
                      </span>

                      {i.session?.capacite != null && (
                        <span className="flex items-center gap-1.5">
                          <Users
                            className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400"
                            aria-hidden
                          />
                          {i.session.capacite} places
                        </span>
                      )}
                    </div>

                    {/* Motif de refus */}
                    {i.motifRefus && (
                      <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
                        <strong>Motif du refus :</strong> {i.motifRefus}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="h-9 rounded-lg"
                    >
                      <Link href={`/formations/${i.session?.formation?.slug ?? ''}`}>
                        Voir la formation
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </Button>

                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setToCancel(i)}
                        disabled={cancelMutation.isPending}
                        className={cn(
                          'h-9 rounded-lg text-red-600',
                          'hover:bg-red-50 hover:text-red-700',
                          'dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
                        )}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
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

      {/* Dialog de confirmation */}
      <ConfirmDialog
        open={!!toCancel}
        onOpenChange={(open) => {
          if (!open) setToCancel(null);
        }}
        onConfirm={() => {
          if (toCancel) cancelMutation.mutate(toCancel.id);
        }}
        title="Annuler cette inscription ?"
        description={
          toCancel
            ? `Votre inscription à « ${toCancel.session?.formation?.titre ?? 'cette formation'} » sera annulée. Cette action est irréversible.`
            : undefined
        }
        confirmLabel="Annuler l'inscription"
        cancelLabel="Conserver"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </>
  );
}