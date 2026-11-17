// src/app/(admin)/admin/domaines/components/DomainesTable.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FolderTree,
  BookOpen,
  ExternalLink,
  AlertCircle,
  RefreshCw,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';
import {
  useDomaines,
  useTogglePublishDomaine,
  type Domaine,
  type DomaineFilters,
} from '@/hooks/useDomaines';
import { DomaineFormModal } from './DomaineFormModal';
import { DeleteDomaineDialog } from './DeleteDomaineDialog';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface DomainesTableProps {
  filters?: DomaineFilters;
}

interface FormationsBadgeProps {
  count: number;
  color?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE COMPTEUR
   ═══════════════════════════════════════════════════════════════════════════ */

function FormationsBadge({ count, color }: FormationsBadgeProps) {
  // ⭐ Garde-fou : count null/undefined → 0
  const safeCount = typeof count === 'number' && Number.isFinite(count) ? count : 0;

  if (safeCount === 0) {
    return (
      <span className="text-odc-text-muted inline-flex items-center gap-1.5 text-xs">
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Aucune formation</span>
      </span>
    );
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
            'text-xs font-semibold',
            'text-odc-primary-active bg-odc-primary-soft',
            'ring-1 ring-odc-primary-light/40',
            'transition-transform hover:scale-105',
          )}
          style={
            color
              ? {
                  backgroundColor: `${color}20`,
                  color,
                  boxShadow: `inset 0 0 0 1px ${color}40`,
                }
              : undefined
          }
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tabular-nums">{safeCount}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {safeCount} formation{safeCount > 1 ? 's' : ''}
      </TooltipContent>
    </Tooltip>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SQUELETTE
   ═══════════════════════════════════════════════════════════════════════════ */

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-odc-border bg-odc-surface-alt/50 border-b p-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-odc-border divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function DomainesTable({ filters }: DomainesTableProps) {
  const router = useRouter();
  const {
    data: domaines = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDomaines(filters);
  const togglePublish = useTogglePublishDomaine();

  /* -------------------- États locaux -------------------- */
  const [editingDomaine, setEditingDomaine] = React.useState<Domaine | null>(null);
  const [deletingDomaine, setDeletingDomaine] = React.useState<Domaine | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  /* -------------------- Handlers -------------------- */
  const handleEdit = React.useCallback((d: Domaine) => {
    setEditingDomaine(d);
  }, []);

  const handleDelete = React.useCallback((d: Domaine) => {
    setDeletingDomaine(d);
  }, []);

  const handleTogglePublish = React.useCallback(
    (d: Domaine) => {
      togglePublish.mutate({ id: d.id, estPubliee: !d.estPubliee });
    },
    [togglePublish],
  );

  /* -------------------- Loading -------------------- */
  if (isLoading) return <TableSkeleton />;

  /* -------------------- Erreur -------------------- */
  if (isError) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="bg-odc-error-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <AlertCircle className="text-odc-error h-5 w-5" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-odc-text-primary text-base font-semibold">
                Erreur de chargement
              </h3>
              <p className="text-odc-text-muted mt-1 text-sm">
                Impossible de charger les domaines.
              </p>
              {error instanceof Error && (
                <p className="text-odc-text-muted mt-1 text-xs font-mono">
                  {error.message}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-3"
              >
                {isFetching ? (
                  <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden />
                )}
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /* -------------------- Vide -------------------- */
  if (!domaines.length) {
    return (
      <>
        <Card>
          <EmptyState
            icon={FolderTree}
            title="Aucun domaine"
            description="Créez votre premier domaine de formation pour organiser votre catalogue."
            action={
              <Button variant="odc" onClick={() => setIsCreateOpen(true)}>
                <FolderTree className="mr-2 h-4 w-4" aria-hidden />
                Créer un domaine
              </Button>
            }
          />
        </Card>

        <DomaineFormModal
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      </>
    );
  }

  /* -------------------- Rendu principal -------------------- */
  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Domaine</TableHead>
              <TableHead className="hidden md:table-cell">Formations</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden lg:table-cell">Ordre</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {domaines.map((d) => (
              <TableRow
                key={d.id}
                className="hover:bg-odc-surface-hover group cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/domaines/${d.id}`)}
              >
                {/* Domaine */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {d.imageUrl ? (
                      <img
                        src={getMediaUrl(d.imageUrl)}
                        alt=""
                        className="ring-odc-border h-11 w-11 shrink-0 rounded-lg object-cover ring-1"
                        onError={(e) => {
                          // ⭐ Fallback si l'image ne charge pas
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center',
                          'rounded-lg text-lg font-semibold',
                          'ring-1 ring-inset ring-black/5',
                        )}
                        style={{
                          backgroundColor: d.couleur
                            ? `${d.couleur}20`
                            : 'var(--odc-primary-soft)',
                          color: d.couleur || 'var(--odc-primary)',
                        }}
                      >
                        {d.icone || '📚'}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-odc-text-primary truncate text-sm font-semibold">
                        {d.nom}
                      </p>
                      <p className="text-odc-text-muted truncate font-mono text-xs">
                        {d.slug}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Formations */}
                <TableCell className="hidden md:table-cell">
                  <FormationsBadge
                    count={Number(d.formationsCount ?? 0)}
                    color={d.couleur}
                  />
                </TableCell>

                {/* Statut */}
                <TableCell>
                  {d.estPubliee ? (
                    <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                      <span className="bg-odc-success mr-1.5 h-1.5 w-1.5 rounded-full" />
                      Publié
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-odc-text-muted">
                      <span className="bg-odc-text-muted mr-1.5 h-1.5 w-1.5 rounded-full" />
                      Brouillon
                    </Badge>
                  )}
                </TableCell>

                {/* Ordre */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-odc-text-muted font-mono text-xs tabular-nums">
                    #{String(d.ordreAffichage ?? 0).padStart(3, '0')}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        aria-label="Actions du domaine"
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(d)}>
                        <Edit className="mr-2 h-4 w-4" aria-hidden />
                        Modifier
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(d)}
                        disabled={togglePublish.isPending}
                      >
                        {d.estPubliee ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" aria-hidden />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" aria-hidden />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          window.open(`/domaines/${d.slug}`, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                        Voir la page
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="focus:bg-odc-error-soft text-odc-error focus:text-odc-error"
                        onClick={() => handleDelete(d)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modales */}
      <DomaineFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <DomaineFormModal
        mode="edit"
        id={editingDomaine?.id}
        open={!!editingDomaine}
        onOpenChange={(open) => !open && setEditingDomaine(null)}
      />

      <DeleteDomaineDialog
        domaine={deletingDomaine}
        open={!!deletingDomaine}
        onOpenChange={(open) => !open && setDeletingDomaine(null)}
      />
    </TooltipProvider>
  );
}