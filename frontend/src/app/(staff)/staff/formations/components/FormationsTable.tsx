// src/app/(staff)/staff/formations/components/FormationsTable.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Layers,
  FileText,
  Plus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { PublicationToggle } from './PublicationToggle';
import { FormationFormModal } from './FormationFormModal';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Formation {
  id: string;
  titre?: string | null;
  slug?: string | null;
  imageUrl?: string | null;   // ⭐ ajout
  niveau?: string | null;
  dureeHeures?: number | null;
  estPubliee?: boolean;
  domaine?: string | null;
  domaineNom?: string | null;
  domaineRelation?: { nom?: string | null; couleur?: string | null } | null;
}

interface FormationsResponse {
  data: Formation[];
  pagination?: {
    page: number;
    totalPages: number;
    total?: number;
    limit?: number;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

const NIVEAU_COLORS: Record<string, string> = {
  DEBUTANT:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  INTERMEDIAIRE:
    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  AVANCE:
    'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getDomaineNom(formation: Formation): string {
  if (formation.domaineRelation?.nom) return formation.domaineRelation.nom;
  if (
    formation.domaine &&
    typeof formation.domaine === 'object' &&
    'nom' in formation.domaine
  ) {
    return (formation.domaine as { nom?: string }).nom ?? 'Sans domaine';
  }
  if (typeof formation.domaine === 'string') return formation.domaine;
  if (formation.domaineNom) return formation.domaineNom;
  return 'Sans domaine';
}

function getDomaineCouleur(formation: Formation): string {
  if (formation.domaineRelation?.couleur) return formation.domaineRelation.couleur;
  if (
    formation.domaine &&
    typeof formation.domaine === 'object' &&
    'couleur' in formation.domaine &&
    (formation.domaine as { couleur?: string }).couleur
  ) {
    return (formation.domaine as { couleur?: string }).couleur!;
  }
  return '#6B7280';
}

function getNiveauLabel(niveau: string | null | undefined): string {
  if (!niveau) return '—';
  return NIVEAU_LABELS[niveau] ?? niveau;
}

function extractFormations(response: unknown): FormationsResponse {
  if (!response || typeof response !== 'object') return { data: [] };
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;

  const rawList =
    (Array.isArray(root.formations) && root.formations) ||
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root.results) && root.results) ||
    (Array.isArray(root) && root) ||
    [];

  const formations = (rawList as unknown[])
    .filter((f): f is Formation => f != null && typeof f === 'object' && 'id' in f)
    .filter((f) => typeof f.id === 'string' && f.id.length > 0);

  return {
    data: formations,
    pagination: (root.pagination as FormationsResponse['pagination']) ?? undefined,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT — Vignette image
   ═══════════════════════════════════════════════════════════════════════════ */

function FormationThumbnail({ formation }: { formation: Formation }) {
  const [errored, setErrored] = useState(false);
  const url = getMediaUrl(formation.imageUrl);
  const initial = formation.titre?.[0]?.toUpperCase() ?? 'F';

  // Pas d'image OU image en erreur → fallback initiale sur gradient
  if (!url || errored) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground">
        {initial}
      </div>
    );
  }

  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setErrored(true)}
        aria-hidden="true"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function FormationsTable() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  /* ─── État modal (create + edit) ─── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setModalOpen(true);
  };

  const closeModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditId(null);
  };

  /* ─── Filtres ─── */
  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    q: searchParams.get('q') ?? undefined,
  };

  /* ─── Query formations ─── */
  const { data, isLoading, isError, refetch, isFetching } = useQuery<FormationsResponse>({
    queryKey: ['staff', 'formations', filters],
    queryFn: async () => {
      const response = await api.get('/staff/formations', { params: filters });
      return extractFormations(response.data);
    },
    staleTime: 30_000,
  });

  /* ─── Mutation delete ─── */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/formations/${id}`);
    },
    onSuccess: () => {
      toast.success('Formation supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'formations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Header commun ─── */
  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Formations
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gérez le catalogue des formations
        </p>
      </div>
      <Button
        onClick={openCreate}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        Nouvelle formation
      </Button>
    </header>
  );

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </CardContent>
        </Card>
        <FormationFormModal open={modalOpen} onOpenChange={closeModal} formationId={editId} />
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
          </CardContent>
        </Card>
        <FormationFormModal open={modalOpen} onOpenChange={closeModal} formationId={editId} />
      </div>
    );
  }

  const formations = data?.data ?? [];

  /* ─── Vide ─── */
  if (formations.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={BookOpen}
              title="Aucune formation"
              description="Créez votre première formation au catalogue."
              action={
                <Button
                  onClick={openCreate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                  Créer une formation
                </Button>
              }
            />
          </CardContent>
        </Card>
        <FormationFormModal open={modalOpen} onOpenChange={closeModal} formationId={editId} />
      </div>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-6">
      {header}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Formation</TableHead>
                <TableHead className="hidden md:table-cell">Domaine</TableHead>
                <TableHead className="hidden lg:table-cell">Niveau</TableHead>
                <TableHead className="hidden lg:table-cell">Durée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {formations.map((f) => {
                const domaineNom = getDomaineNom(f);
                const domaineCouleur = getDomaineCouleur(f);
                const niveauLabel = getNiveauLabel(f.niveau);
                const niveauColor =
                  (f.niveau && NIVEAU_COLORS[f.niveau]) ??
                  'bg-muted text-muted-foreground border border-border';

                return (
                  <TableRow key={f.id} className="group">
                    {/* Formation — ⭐ VIGNETTE IMAGE */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FormationThumbnail formation={f} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {f.titre ?? 'Sans titre'}
                          </p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {f.slug ?? '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Domaine */}
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        className="border text-[11px] font-medium"
                        style={{
                          backgroundColor: `${domaineCouleur}15`,
                          color: domaineCouleur,
                          borderColor: `${domaineCouleur}30`,
                        }}
                      >
                        <Layers className="mr-1 h-2.5 w-2.5" aria-hidden="true" />
                        {domaineNom}
                      </Badge>
                    </TableCell>

                    {/* Niveau */}
                    <TableCell className="hidden lg:table-cell">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          niveauColor,
                        )}
                      >
                        {niveauLabel}
                      </span>
                    </TableCell>

                    {/* Durée */}
                    <TableCell className="hidden lg:table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {f.dureeHeures ? `${f.dureeHeures}h` : '—'}
                      </span>
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <PublicationToggle
                        formationId={f.id}
                        estPubliee={f.estPubliee === true}
                        onToggle={() =>
                          qc.invalidateQueries({ queryKey: ['staff', 'formations'] })
                        }
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-foreground group-hover:opacity-100"
                            aria-label={`Actions pour ${f.titre ?? 'la formation'}`}
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(f.id)}>
                            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              window.location.href = `/staff/formations/${f.id}`;
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Supprimer "${f.titre ?? 'cette formation'}" ?`)) {
                                deleteMutation.mutate(f.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      <FormationFormModal
        open={modalOpen}
        onOpenChange={closeModal}
        formationId={editId}
      />
    </div>
  );
}