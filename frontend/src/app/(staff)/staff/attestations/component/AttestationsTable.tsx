// src/app/(staff)/staff/attestations/components/AttestationsTable.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Award,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { GenerateDialog } from './GenerateDialog';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Attestation {
  id: string;
  numero: string;
  valide: boolean;
  dateEmission?: string | null;
  participant?: {
    id?: string;
    prenom?: string | null;
    nom?: string | null;
    email?: string | null;
    photoUrl?: string | null;   // ⭐ photo du participant
  } | null;
  session?: {
    id?: string;
    codeSession?: string;
    formation?: { titre?: string | null } | null;
  } | null;
}

interface AttestationsResponse {
  data: Attestation[];
  pagination?: { page: number; totalPages: number; total?: number };
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractAttestations(response: unknown): AttestationsResponse {
  if (!response || typeof response !== 'object') return { data: [] };
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;

  const rawList =
    (Array.isArray(root.attestations) && root.attestations) ||
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root) && root) ||
    [];

  const attestations = (rawList as unknown[])
    .filter(
      (a): a is Attestation => a != null && typeof a === 'object' && 'id' in a,
    )
    .filter((a) => typeof a.id === 'string' && a.id.length > 0);

  return {
    data: attestations,
    pagination:
      (root.pagination as AttestationsResponse['pagination']) ?? undefined,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR PARTICIPANT (image + fallback initiales)
   ═══════════════════════════════════════════════════════════════════════════ */

function ParticipantAvatar({
  prenom,
  nom,
  photoUrl,
}: {
  prenom?: string | null;
  nom?: string | null;
  photoUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const initials =
    `${prenom?.[0] ?? '?'}${nom?.[0] ?? ''}`.toUpperCase() || '?';

  const raw = photoUrl?.trim();
  const src =
    !imageError && raw
      ? /^https?:\/\//i.test(raw)
        ? raw
        : getMediaUrl(raw)
      : null;

  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-semibold text-white ring-2 ring-white dark:ring-slate-900">
      {(!src || !imageLoaded) && <span aria-hidden>{initials}</span>}

      {src && (
        <img
          src={src}
          alt={`${prenom ?? ''} ${nom ?? ''}`.trim() || 'Avatar'}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationsTable() {
  const qc = useQueryClient();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [attestationToInvalidate, setAttestationToInvalidate] =
    useState<Attestation | null>(null);

  const { data, isLoading, isError, refetch, isFetching } =
    useQuery<AttestationsResponse>({
      queryKey: ['staff', 'attestations'],
      queryFn: async () => {
        const response = await api.get('/staff/attestations', {
          params: { limit: 100 },
        });
        return extractAttestations(response.data);
      },
      staleTime: 30_000,
    });

  const invalidateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/attestations/${id}`);
    },
    onSuccess: () => {
      toast.success('Attestation invalidée');
      qc.invalidateQueries({ queryKey: ['staff', 'attestations'] });
      setAttestationToInvalidate(null);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const download = async (id: string, numero: string) => {
    setDownloading(id);
    try {
      const response = await api.get(`/staff/attestations/${id}/telecharger`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Téléchargement lancé');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDownloading(null);
    }
  };

  /* ── Header ─────────────────────────────────────────── */
  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
          Attestations
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Générez et gérez les attestations de formation.
        </p>
      </div>
      <GenerateDialog />
    </header>
  );

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <QueryErrorState
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const attestations = data?.data ?? [];

  /* ── Vide ───────────────────────────────────────────── */
  if (attestations.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState
              icon={Award}
              title="Aucune attestation"
              description="Générez vos premières attestations depuis une session terminée."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Rendu principal ────────────────────────────────── */
  return (
    <div className="space-y-6">
      {header}

      <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Numéro
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Participant
                </TableHead>
                <TableHead className="hidden text-slate-700 dark:text-slate-300 md:table-cell">
                  Formation
                </TableHead>
                <TableHead className="hidden text-slate-700 dark:text-slate-300 lg:table-cell">
                  Émise le
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Valide
                </TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attestations.map((a) => {
                const isDownloading = downloading === a.id;

                return (
                  <TableRow
                    key={a.id}
                    className="group border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    {/* Numéro */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                          <Award className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {a.numero}
                          </p>
                          {a.session?.codeSession && (
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {a.session.codeSession}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Participant + avatar photo */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ParticipantAvatar
                          prenom={a.participant?.prenom}
                          nom={a.participant?.nom}
                          photoUrl={a.participant?.photoUrl}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                            {a.participant?.prenom ?? ''}{' '}
                            {a.participant?.nom ?? ''}
                          </p>
                          {a.participant?.email && (
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {a.participant.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Formation */}
                    <TableCell className="hidden md:table-cell">
                      <p className="truncate text-sm text-slate-900 dark:text-slate-50">
                        {a.session?.formation?.titre ?? '—'}
                      </p>
                    </TableCell>

                    {/* Émise le */}
                    <TableCell className="hidden text-sm text-slate-500 dark:text-slate-400 lg:table-cell">
                      <span className="tabular-nums">
                        {formatDate(a.dateEmission)}
                      </span>
                    </TableCell>

                    {/* Statut valide */}
                    <TableCell>
                      {a.valide ? (
                        <Badge className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" aria-hidden />
                          Valide
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="inline-flex items-center gap-1 border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-300"
                        >
                          <XCircle className="h-3 w-3" aria-hidden />
                          Invalide
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Télécharger */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-8 w-8 rounded-lg text-slate-400 opacity-60 transition-all group-hover:opacity-100',
                            'hover:bg-slate-100 hover:text-slate-900',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
                            'dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-600',
                          )}
                          onClick={() => download(a.id, a.numero)}
                          disabled={isDownloading}
                          aria-label={`Télécharger l'attestation ${a.numero}`}
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Download className="h-4 w-4" aria-hidden />
                          )}
                        </Button>

                        {/* Vérifier (lien externe) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-8 w-8 rounded-lg text-slate-400 opacity-60 transition-all group-hover:opacity-100',
                            'hover:bg-slate-100 hover:text-slate-900',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
                            'dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-600',
                          )}
                          asChild
                        >
                          <a
                            href={`/verifier-attestation/${a.numero}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Vérifier l'attestation ${a.numero}`}
                          >
                            <Eye className="h-4 w-4" aria-hidden />
                          </a>
                        </Button>

                        {/* Invalider (si valide) */}
                        {a.valide && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8 rounded-lg text-slate-400 opacity-60 transition-all group-hover:opacity-100',
                              'hover:bg-red-50 hover:text-red-600',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
                              'dark:hover:bg-red-950/30 dark:hover:text-red-400',
                            )}
                            onClick={() => setAttestationToInvalidate(a)}
                            disabled={invalidateMutation.isPending}
                            aria-label={`Invalider l'attestation ${a.numero}`}
                          >
                            {invalidateMutation.isPending &&
                            invalidateMutation.variables === a.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                              <Ban className="h-4 w-4" aria-hidden />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      {/* ⭐ Dialog de confirmation d'invalidation */}
      <ConfirmDialog
        open={!!attestationToInvalidate}
        onOpenChange={(open) => {
          if (!open) setAttestationToInvalidate(null);
        }}
        onConfirm={() => {
          if (attestationToInvalidate)
            invalidateMutation.mutate(attestationToInvalidate.id);
        }}
        title="Invalider cette attestation ?"
        description={
          attestationToInvalidate
            ? `L'attestation "${attestationToInvalidate.numero}" émise au nom de ${attestationToInvalidate.participant?.prenom ?? ''} ${attestationToInvalidate.participant?.nom ?? ''} sera révoquée. Le document ne sera plus considéré comme valide.`
            : undefined
        }
        confirmLabel="Invalider l'attestation"
        cancelLabel="Annuler"
        variant="danger"
        loading={invalidateMutation.isPending}
      />
    </div>
  );
}