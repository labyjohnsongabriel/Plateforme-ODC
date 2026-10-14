// src/app/(admin)/admin/attestations/components/AttestationsTable.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Award,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Hash,
  Eye,
  UserX,
  UserCheck,
  Clock,
  FileDown,
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import {
  useAttestations,
  useDownloadAttestation,
  useInvalidateAttestation,
  useReactivateAttestation,
  type Attestation,
} from '@/hooks/useAttestations';
import { AttestationDetailModal } from './AttestationDetailModal';

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-odc-border">
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

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function AttestationsTable() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

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

  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={Award}
          title="Erreur de chargement"
          description="Impossible de charger les attestations."
          action={
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
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
      <Card>
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
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Numéro</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead className="hidden md:table-cell">Formation</TableHead>
              <TableHead className="hidden lg:table-cell text-center">
                Présence
              </TableHead>
              <TableHead className="hidden lg:table-cell text-center">
                Note
              </TableHead>
              <TableHead className="hidden xl:table-cell">Émise le</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {attestations.map((a) => (
              <TableRow
                key={a.id}
                className="group cursor-pointer transition-colors hover:bg-odc-surface-hover"
                onClick={() => setSelectedId(a.id)}
              >
                {/* Numéro */}
                <TableCell>
                  <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-odc-text-primary">
                    <Hash className="h-3 w-3 text-odc-text-muted" />
                    {a.numero}
                  </span>
                </TableCell>

                {/* Participant */}
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-odc-text-primary">
                      {a.participant?.prenom} {a.participant?.nom}
                    </p>
                    <p className="truncate text-xs text-odc-text-muted">
                      {a.participant?.email}
                    </p>
                  </div>
                </TableCell>

                {/* Formation */}
                <TableCell className="hidden md:table-cell">
                  <p className="truncate text-sm text-odc-text-secondary">
                    {a.session?.formation?.titre ?? '—'}
                  </p>
                  {a.session?.codeSession && (
                    <p className="truncate font-mono text-xs text-odc-text-muted">
                      {a.session.codeSession}
                    </p>
                  )}
                </TableCell>

                {/* Présence */}
                <TableCell className="hidden lg:table-cell text-center">
                  {a.tauxPresence !== undefined ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        a.tauxPresence >= 75
                          ? 'bg-odc-success-soft text-odc-success-dark'
                          : 'bg-odc-warning-soft text-odc-warning-dark',
                      )}
                    >
                      {a.tauxPresence}%
                    </span>
                  ) : (
                    <span className="text-xs text-odc-text-muted">—</span>
                  )}
                </TableCell>

                {/* Note */}
                <TableCell className="hidden lg:table-cell text-center">
                  {a.noteFinale !== undefined ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        a.noteFinale >= 10
                          ? 'bg-odc-success-soft text-odc-success-dark'
                          : 'bg-odc-error-soft text-odc-error-dark',
                      )}
                    >
                      {a.noteFinale}/20
                    </span>
                  ) : (
                    <span className="text-xs text-odc-text-muted">—</span>
                  )}
                </TableCell>

                {/* Date */}
                <TableCell className="hidden xl:table-cell text-xs text-odc-text-muted">
                  {formatDate(a.dateEmission)}
                </TableCell>

                {/* Statut */}
                <TableCell>
                  {a.valide ? (
                    <Badge className="gap-1 bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                      <CheckCircle2 className="h-3 w-3" />
                      Valide
                    </Badge>
                  ) : (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Badge
                              variant="outline"
                              className="gap-1 border-odc-error/30 text-odc-error-dark"
                            >
                              <XCircle className="h-3 w-3" />
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
                            size="icon-sm"
                            onClick={() => setSelectedId(a.id)}
                            aria-label="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voir les détails</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              downloadMutation.mutate({
                                id: a.id,
                                numero: a.numero,
                              })
                            }
                            disabled={downloadMutation.isPending}
                            aria-label="Télécharger le PDF"
                          >
                            <FileDown className="h-4 w-4" />
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
                            size="icon-sm"
                            asChild
                            aria-label="Vérifier"
                          >
                            <a
                              href={`/verifier-attestation/${a.numero}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
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
          <div className="border-t border-odc-border p-4">
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