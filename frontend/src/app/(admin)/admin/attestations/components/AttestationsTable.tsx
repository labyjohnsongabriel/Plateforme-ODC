// src/app/(admin)/admin/attestations/components/AttestationsTable.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Award,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Hash,
  Eye,
  FileDown,
  Mail,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { ParticipantAvatar } from '@/components/shared/ParticipantAvatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import {
  useAttestations,
  useDownloadAttestation,
} from '@/hooks/useAttestations';
import { AttestationDetailModal } from './AttestationDetailModal';

/* ═══════════════════════════════════════════════════════════════════════════
   SQUELETTE
   ═══════════════════════════════════════════════════════════════════════════ */

function TableSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationsTable() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = React.useState<string | null>(null);

  const filters = React.useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: 20,
      sessionId: searchParams.get('sessionId') ?? undefined,
      formationId: searchParams.get('formationId') ?? undefined,
      valide:
        (searchParams.get('valide') as 'all' | 'true' | 'false') ?? 'all',
      search: searchParams.get('search') ?? undefined,
      dateDebut: searchParams.get('dateDebut') ?? undefined,
      dateFin: searchParams.get('dateFin') ?? undefined,
    }),
    [searchParams],
  );

  const { data, isLoading, isError } = useAttestations(filters);
  const downloadMutation = useDownloadAttestation();

  /* ⭐ Envoi par email */
  const handleSendEmail = async (id: string, numero: string) => {
    setSendingEmail(id);
    try {
      await api.post(`/admin/attestations/${id}/envoyer`);
      toast.success(`📧 Attestation ${numero} envoyée par email`, {
        duration: 5000,
      });
    } catch (e) {
      toast.error(
        getErrorMessage(e) ||
          "Impossible d'envoyer l'email. Vérifiez la configuration SMTP.",
        { duration: 5000 },
      );
    } finally {
      setSendingEmail(null);
    }
  };

  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          icon={Award}
          title="Erreur de chargement"
          description="Impossible de charger les attestations."
          action={
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-9 rounded-lg"
            >
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  const attestations = data?.data ?? [];

  if (!attestations.length) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          icon={Award}
          title="Aucune attestation"
          description="Générez des attestations depuis une session terminée."
        />
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
              <TableHead className="w-[140px]">Numéro</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead className="hidden md:table-cell">Formation</TableHead>
              <TableHead className="hidden text-center lg:table-cell">
                Présence
              </TableHead>
              <TableHead className="hidden text-center lg:table-cell">
                Note
              </TableHead>
              <TableHead className="hidden xl:table-cell">Émise le</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {attestations.map((a) => (
              <TableRow
                key={a.id}
                className="group cursor-pointer border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                onClick={() => setSelectedId(a.id)}
              >
                {/* Numéro */}
                <TableCell>
                  <span className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                    <Hash
                      className="h-3 w-3 text-slate-400 dark:text-slate-500"
                      aria-hidden
                    />
                    {a.numero}
                  </span>
                </TableCell>

                {/* Participant */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ParticipantAvatar
                      prenom={a.participant?.prenom}
                      nom={a.participant?.nom}
                      photoUrl={a.participant?.photoUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {a.participant?.prenom} {a.participant?.nom}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {a.participant?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Formation */}
                <TableCell className="hidden md:table-cell">
                  <p className="truncate text-sm">
                    {a.session?.formation?.titre ?? '—'}
                  </p>
                  {a.session?.codeSession && (
                    <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                      {a.session.codeSession}
                    </p>
                  )}
                </TableCell>

                {/* Présence */}
                <TableCell className="hidden text-center lg:table-cell">
                  {a.tauxPresence !== undefined ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        a.tauxPresence >= 75
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
                      )}
                    >
                      {a.tauxPresence}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>

                {/* Note */}
                <TableCell className="hidden text-center lg:table-cell">
                  {a.noteFinale !== undefined ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        a.noteFinale >= 10
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
                      )}
                    >
                      {a.noteFinale}/20
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>

                {/* Date */}
                <TableCell className="hidden text-xs text-slate-500 dark:text-slate-400 xl:table-cell">
                  {formatDate(a.dateEmission)}
                </TableCell>

                {/* Statut */}
                <TableCell>
                  {a.valide ? (
                    <Badge className="gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Valide
                    </Badge>
                  ) : (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Badge
                              variant="outline"
                              className="gap-1 border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-300"
                            >
                              <XCircle className="h-3 w-3" aria-hidden />
                              Invalide
                            </Badge>
                          </span>
                        </TooltipTrigger>
                        {a.motifInvalidation && (
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">
                              <strong>Motif :</strong> {a.motifInvalidation}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-1">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedId(a.id)}
                            aria-label="Voir les détails"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                          >
                            <Eye className="h-4 w-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voir les détails</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* ⭐ Envoyer par email */}
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendEmail(a.id, a.numero)}
                            disabled={sendingEmail === a.id || !a.valide}
                            aria-label="Envoyer par email"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                          >
                            {sendingEmail === a.id ? (
                              <Loader2
                                className="h-4 w-4 animate-spin"
                                aria-hidden
                              />
                            ) : (
                              <Mail className="h-4 w-4" aria-hidden />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {sendingEmail === a.id
                            ? 'Envoi en cours…'
                            : 'Envoyer par email'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              downloadMutation.mutate({
                                id: a.id,
                                numero: a.numero,
                              })
                            }
                            disabled={downloadMutation.isPending}
                            aria-label="Télécharger le PDF"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                          >
                            <FileDown className="h-4 w-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Télécharger le PDF</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label="Vérifier"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                          >
                            <a
                              href={`/verifier-attestation/${a.numero}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Vérifier en ligne</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      {/* Modale de détail */}
      <AttestationDetailModal
        attestationId={selectedId ?? undefined}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </>
  );
}