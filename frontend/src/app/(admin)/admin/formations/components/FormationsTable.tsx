// src/app/(admin)/admin/formations/components/FormationsTable.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  StarOff,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Plus,
  Pencil,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormationFormModal } from './FormationFormModal';

import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ============================================================================
   CONFIGURATION NIVEAU
   ============================================================================ */

const NIVEAU_CONFIG: Record<string, { label: string; color: string }> = {
  DEBUTANT: {
    label: 'Débutant',
    color:
      'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  },
  INTERMEDIAIRE: {
    label: 'Intermédiaire',
    color:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  },
  AVANCE: {
    label: 'Avancé',
    color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
};

/* ============================================================================
   TYPES
   ============================================================================ */

type SortField = 'titre' | 'createdAt' | 'nbVues' | 'dureeHeures';
type SortOrder = 'asc' | 'desc';

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationsTable() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  /* -------------------- États -------------------- */
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // ⭐ États pour le modal de création/édition
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | undefined>();

  /* -------------------- Filtres -------------------- */
  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: 10,
      q: searchParams.get('q') ?? undefined,
      domaineId: searchParams.get('domaineId') ?? undefined,
      niveau: searchParams.get('niveau') ?? undefined,
      estPubliee: searchParams.get('estPubliee') ?? undefined,
    }),
    [searchParams],
  );

  /* -------------------- Query -------------------- */
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'formations', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/formations', {
        params: filters,
      });
      return data;
    },
  });

  /* -------------------- Mutations -------------------- */
  const publishMutation = useMutation({
    mutationFn: async ({
      id,
      estPubliee,
    }: {
      id: string;
      estPubliee: boolean;
    }) => {
      await api.put(`/admin/formations/${id}/publier`, { estPubliee });
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.estPubliee ? 'Formation publiée' : 'Formation dépubliée',
      );
      qc.invalidateQueries({ queryKey: ['admin', 'formations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const miseEnAvantMutation = useMutation({
    mutationFn: async ({
      id,
      miseEnAvant,
    }: {
      id: string;
      miseEnAvant: boolean;
    }) => {
      await api.put(`/admin/formations/${id}/mise-en-avant`, { miseEnAvant });
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.miseEnAvant
          ? 'Ajoutée aux mises en avant ⭐'
          : 'Retirée des mises en avant',
      );
      qc.invalidateQueries({ queryKey: ['admin', 'formations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/formations/${id}`);
    },
    onSuccess: () => {
      toast.success('Formation supprimée');
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ['admin', 'formations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/admin/formations/${id}`)));
    },
    onSuccess: () => {
      toast.success(`${selectedIds.length} formation(s) supprimée(s)`);
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ['admin', 'formations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* -------------------- Modal : Ouvrir en création -------------------- */
  const openCreate = () => {
    setModalMode('create');
    setEditingId(undefined);
    setModalOpen(true);
  };

  /* -------------------- Modal : Ouvrir en édition -------------------- */
  const openEdit = (id: string) => {
    setModalMode('edit');
    setEditingId(id);
    setModalOpen(true);
  };

  /* -------------------- Modal : Succès -------------------- */
  const handleModalSuccess = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'formations'] });
    qc.invalidateQueries({ queryKey: ['formations', 'public'] });
  };

  /* -------------------- Tri -------------------- */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-odc-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-odc-primary" />
    );
  };

  /* -------------------- Sélection -------------------- */
  const formations = data?.data ?? [];

  const toggleSelectAll = () => {
    if (selectedIds.length === formations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(formations.map((f: any) => f.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /* -------------------- Tri des données -------------------- */
  const sortedFormations = useMemo(() => {
    return [...formations].sort((a: any, b: any) => {
      let comparison = 0;
      switch (sortField) {
        case 'titre':
          comparison = (a.titre ?? '').localeCompare(b.titre ?? '');
          break;
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'nbVues':
          comparison = (a.nbVues ?? 0) - (b.nbVues ?? 0);
          break;
        case 'dureeHeures':
          comparison = (a.dureeHeures ?? 0) - (b.dureeHeures ?? 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [formations, sortField, sortOrder]);

  /* -------------------- Loading -------------------- */
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </Card>
    );
  }

  /* -------------------- Vide -------------------- */
  if (!formations.length) {
    return (
      <>
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Aucune formation"
            description="Commencez par créer votre première formation"
            action={
              <Button variant="odc" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une formation
              </Button>
            }
          />
        </Card>

        {/* Modal toujours disponible même quand vide */}
        <FormationFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          id={editingId}
          onSuccess={handleModalSuccess}
        />
      </>
    );
  }

  /* -------------------- Rendu -------------------- */
  return (
    <>
      {/* ================================================================
          EN-TÊTE : TITRE + BOUTON NOUVELLE
          ================================================================ */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-odc-text-primary">
            Toutes les formations
          </h2>
          <p className="text-sm text-odc-muted">
            {data?.pagination?.total ?? formations.length} formation(s) au total
          </p>
        </div>

        <Button variant="odc" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formation
        </Button>
      </div>

      {/* ================================================================
          BARRE D'ACTIONS GROUPÉES
          ================================================================ */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-odc-primary-soft/40 border border-odc-primary/30 animate-slide-in-down">
          <span className="text-sm font-medium text-odc-primary">
            {selectedIds.length} formation(s) sélectionnée(s)
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkDeleteMutation.mutate(selectedIds)}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Supprimer
            </Button>
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

      {/* ================================================================
          TABLE
          ================================================================ */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === formations.length &&
                    formations.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none hover:text-odc-primary"
                onClick={() => handleSort('titre')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Formation
                  {getSortIcon('titre')}
                </span>
              </TableHead>

              <TableHead className="hidden md:table-cell">Domaine</TableHead>

              <TableHead className="hidden lg:table-cell">Niveau</TableHead>

              <TableHead
                className="hidden lg:table-cell cursor-pointer select-none hover:text-odc-primary"
                onClick={() => handleSort('dureeHeures')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Durée
                  {getSortIcon('dureeHeures')}
                </span>
              </TableHead>

              <TableHead
                className="hidden xl:table-cell text-right cursor-pointer select-none hover:text-odc-primary"
                onClick={() => handleSort('nbVues')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Vues
                  {getSortIcon('nbVues')}
                </span>
              </TableHead>

              <TableHead>Statut</TableHead>

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedFormations.map((f: any) => {
              const niveauConfig =
                NIVEAU_CONFIG[f.niveau] ?? NIVEAU_CONFIG.DEBUTANT;
              const isSelected = selectedIds.includes(f.id);

              return (
                <TableRow
                  key={f.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="hover:bg-odc-surface-alt/50 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectOne(f.id)}
                      aria-label={`Sélectionner ${f.titre}`}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      {f.imageUrl ? (
                        <img
                          src={f.imageUrl}
                          alt={f.titre}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-odc-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-odc-primary" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate flex items-center gap-1.5">
                          {f.miseEnAvant && (
                            <Star className="h-3 w-3 text-odc-primary fill-odc-primary shrink-0" />
                          )}
                          <span className="truncate">{f.titre}</span>
                        </p>
                        <p className="text-xs text-odc-muted truncate font-mono">
                          {f.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {f.domaineRelation?.nom ?? f.domaine ?? '—'}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-transparent text-xs',
                        niveauConfig.color,
                      )}
                    >
                      {niveauConfig.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-sm text-odc-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {f.dureeHeures}h
                    </span>
                  </TableCell>

                  <TableCell className="hidden xl:table-cell text-sm text-odc-muted text-right tabular-nums">
                    {(f.nbVues ?? 0).toLocaleString('fr-FR')}
                  </TableCell>

                  <TableCell>
                    {f.estPubliee ? (
                      <Badge className="bg-odc-success-bg text-odc-success hover:bg-odc-success-bg gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-odc-success" />
                        Publiée
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-odc-muted gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-odc-muted" />
                        Brouillon
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/formations/${f.id}`}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le détail
                          </Link>
                        </DropdownMenuItem>

                        {/* ⭐ Modifier ouvre le modal */}
                        <DropdownMenuItem
                          onClick={() => openEdit(f.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href={`/formations/${f.slug}`}
                            target="_blank"
                            className="cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Voir sur le site
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            publishMutation.mutate({
                              id: f.id,
                              estPubliee: !f.estPubliee,
                            })
                          }
                        >
                          {f.estPubliee ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Dépublier
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Publier
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            miseEnAvantMutation.mutate({
                              id: f.id,
                              miseEnAvant: !f.miseEnAvant,
                            })
                          }
                        >
                          {f.miseEnAvant ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Retirer des mises en avant
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Mettre en avant
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-odc-error focus:text-odc-error"
                          onClick={() => setDeleteTarget(f)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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

        {data?.pagination?.totalPages > 1 && (
          <div className="p-4 border-t border-odc-border">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      {/* ================================================================
          MODAL CRÉATION/ÉDITION ⭐
          ================================================================ */}
      <FormationFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        id={editingId}
        onSuccess={handleModalSuccess}
      />

      {/* ================================================================
          DIALOG SUPPRESSION
          ================================================================ */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette formation ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La formation{' '}
              <strong>{deleteTarget?.titre}</strong> sera définitivement
              supprimée, ainsi que toutes ses sessions associées.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}