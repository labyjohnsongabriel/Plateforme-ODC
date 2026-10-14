// src/app/(admin)/admin/attestations/components/AttestationsTableWithSelection.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Award,
  Eye,
  FileDown,
  ExternalLink,
  Hash,
  CheckCircle2,
  XCircle,
  Trash2,
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
import { Checkbox } from '@/components/ui/checkbox';
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
  type Attestation,
} from '@/hooks/useAttestations';
import { AttestationDetailModal } from './AttestationDetailModal';
import { BulkDownloadButton } from './BulkDownloadButton';

export function AttestationsTableWithSelection() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const filters = React.useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: 20,
      sessionId: searchParams.get('sessionId') ?? undefined,
      valide:
        (searchParams.get('valide') as 'all' | 'true' | 'false') ?? 'all',
      search: searchParams.get('search') ?? undefined,
    }),
    [searchParams],
  );

  const { data, isLoading, isError } = useAttestations(filters);
  const downloadMutation = useDownloadAttestation();

  const toggleSelectAll = () => {
    const all = data?.data ?? [];
    if (selectedIds.length === all.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(all.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="divide-y divide-odc-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

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
      {/* Barre de sélection */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-odc-primary/30 bg-odc-primary-soft/40 p-3">
          <span className="text-sm font-medium text-odc-primary-active">
            {selectedIds.length} attestation(s) sélectionnée(s)
          </span>
          <div className="ml-auto flex gap-2">
            <BulkDownloadButton
              ids={selectedIds}
              fileName="attestations-selection"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === attestations.length &&
                    attestations.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead>Numéro</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead className="hidden md:table-cell">Formation</TableHead>
              <TableHead className="hidden lg:table-cell">Émise le</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {attestations.map((a) => {
              const isSelected = selectedIds.includes(a.id);
              return (
                <TableRow
                  key={a.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="group cursor-pointer hover:bg-odc-surface-hover"
                  onClick={() => setSelectedId(a.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectOne(a.id)}
                      aria-label={`Sélectionner ${a.numero}`}
                    />
                  </TableCell>

                  <TableCell>
                    <span className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                      <Hash className="h-3 w-3 text-odc-text-muted" />
                      {a.numero}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {a.participant?.prenom} {a.participant?.nom}
                      </p>
                      <p className="truncate text-xs text-odc-text-muted">
                        {a.participant?.email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-sm">
                    {a.session?.formation?.titre ?? '—'}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-xs text-odc-text-muted">
                    {formatDate(a.dateEmission)}
                  </TableCell>

                  <TableCell>
                    {a.valide ? (
                      <Badge className="gap-1 bg-odc-success-soft text-odc-success-dark">
                        <CheckCircle2 className="h-3 w-3" />
                        Valide
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 text-odc-error"
                      >
                        <XCircle className="h-3 w-3" />
                        Invalide
                      </Badge>
                    )}
                  </TableCell>

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
                              aria-label="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voir</TooltipContent>
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
                              aria-label="Télécharger"
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Télécharger</TooltipContent>
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
                          <TooltipContent>Vérifier</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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

      <AttestationDetailModal
        attestationId={selectedId ?? undefined}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </>
  );
}