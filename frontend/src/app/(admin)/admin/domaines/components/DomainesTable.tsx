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
import {
  useDomaines,
  useTogglePublishDomaine,
  type Domaine,
  type DomaineFilters,          // ✅ IMPORT CORRIGÉ
} from '@/hooks/useDomaines';
import { DomaineFormModal } from './DomaineFormModal';
import { DeleteDomaineDialog } from './DeleteDomaineDialog';

/* ============================================================================
   TYPES
   ============================================================================ */

interface DomainesTableProps {
  filters?: DomaineFilters;
}

/* ============================================================================
   BADGE COMPTEUR DE FORMATIONS
   ============================================================================ */

interface FormationsBadgeProps {
  count: number;
  color?: string;
}

function FormationsBadge({ count, color }: FormationsBadgeProps) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-odc-text-muted">
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
            'bg-odc-primary-soft text-odc-primary-active',
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
          <span className="tabular-nums">{count}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {count} formation{count > 1 ? 's' : ''}
      </TooltipContent>
    </Tooltip>
  );
}

/* ============================================================================
   SQUELETTE DE CHARGEMENT
   ============================================================================ */

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-odc-border bg-odc-surface-alt/50 p-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y divide-odc-border">
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

/* ============================================================================
   COMPOSANT PRINCIPAL
   ============================================================================ */

export function DomainesTable({ filters }: DomainesTableProps) {
  const router = useRouter();
  const { data: domaines = [], isLoading, isError } = useDomaines(filters);
  const togglePublish = useTogglePublishDomaine();

  /* -------------------- États locaux (modales) -------------------- */
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

  /* -------------------- État de chargement -------------------- */
  if (isLoading) return <TableSkeleton />;

  /* -------------------- État d'erreur -------------------- */
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={FolderTree}
          title="Erreur de chargement"
          description="Impossible de charger les domaines. Veuillez réessayer."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  /* -------------------- État vide -------------------- */
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
                <FolderTree className="mr-2 h-4 w-4" />
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
                className="group cursor-pointer transition-colors hover:bg-odc-surface-hover"
                onClick={() => router.push(`/admin/domaines/${d.id}`)}
              >
                {/* Colonne Domaine */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {d.imageUrl ? (
                      <img
                        src={d.imageUrl}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-odc-border"
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
                      <p className="truncate text-sm font-semibold text-odc-text-primary">
                        {d.nom}
                      </p>
                      <p className="truncate font-mono text-xs text-odc-text-muted">
                        {d.slug}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Colonne Formations */}
                <TableCell className="hidden md:table-cell">
                  <FormationsBadge count={d.formationsCount} color={d.couleur} />
                </TableCell>

                {/* Colonne Statut */}
                <TableCell>
                  {d.estPubliee ? (
                    <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-success" />
                      Publié
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-odc-text-muted">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-text-muted" />
                      Brouillon
                    </Badge>
                  )}
                </TableCell>

                {/* Colonne Ordre */}
                <TableCell className="hidden lg:table-cell">
                  <span className="font-mono text-xs tabular-nums text-odc-text-muted">
                    #{d.ordreAffichage.toString().padStart(3, '0')}
                  </span>
                </TableCell>

                {/* Colonne Actions */}
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
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(d)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(d)}
                        disabled={togglePublish.isPending}
                      >
                        {d.estPubliee ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          window.open(`/domaines/${d.slug}`, '_blank')
                        }
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir la page
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-odc-error focus:bg-odc-error-soft focus:text-odc-error"
                        onClick={() => handleDelete(d)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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