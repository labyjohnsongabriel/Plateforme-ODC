// src/app/(admin)/admin/formations/components/FormationsTable.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Clock,
  Users,
  Award,
  FolderTree,
  Calendar,
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
  useFormations,
  useTogglePublishFormation,
  type Formation,
  type FormationFilters,
  type Niveau,
} from '@/hooks/useFormations';
import { FormationFormModal } from './FormationFormModal';
import { DeleteFormationDialog } from './DeleteFormationDialog';

/* ============================================================================
   TYPES
   ============================================================================ */

interface FormationsTableProps {
  filters?: FormationFilters;
}

/* ============================================================================
   BADGE NIVEAU
   ============================================================================ */

const NIVEAU_CONFIG: Record<Niveau, { label: string; className: string }> = {
  DEBUTANT: {
    label: 'Débutant',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  INTERMEDIAIRE: {
    label: 'Intermédiaire',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  AVANCE: {
    label: 'Avancé',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
};

function NiveauBadge({ niveau }: { niveau: Niveau }) {
  const config = NIVEAU_CONFIG[niveau] ?? NIVEAU_CONFIG.DEBUTANT;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

/* ============================================================================
   COMPTEUR
   ============================================================================ */

interface CounterBadgeProps {
  count: number;
  icon: React.ElementType;
  label: string;
  tone?: 'primary' | 'success' | 'info' | 'warning';
}

const TONES = {
  primary:
    'bg-odc-primary-soft text-odc-primary-active ring-odc-primary-light/40',
  success: 'bg-odc-success-soft text-odc-success-dark ring-odc-success/30',
  info: 'bg-odc-info-soft text-odc-info-dark ring-odc-info/30',
  warning: 'bg-odc-warning-soft text-odc-warning-dark ring-odc-warning/30',
} as const;

function CounterBadge({
  count,
  icon: Icon,
  label,
  tone = 'primary',
}: CounterBadgeProps) {
  if (count === 0) {
    return (
      <span className="text-xs text-odc-text-muted" aria-label={`Aucune ${label}`}>
        —
      </span>
    );
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
            'text-xs font-semibold tabular-nums ring-1 ring-inset',
            'transition-transform hover:scale-105',
            TONES[tone],
          )}
          aria-label={`${count} ${label}${count > 1 ? 's' : ''}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{count}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {count} {label}
        {count > 1 ? 's' : ''}
      </TooltipContent>
    </Tooltip>
  );
}

/* ============================================================================
   SQUELETTE
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
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-24" />
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

export function FormationsTable({ filters }: FormationsTableProps) {
  const router = useRouter();
  const { data: formations = [], isLoading, isError } = useFormations(filters);
  const togglePublish = useTogglePublishFormation();

  const [editingFormation, setEditingFormation] =
    React.useState<Formation | null>(null);
  const [deletingFormation, setDeletingFormation] =
    React.useState<Formation | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const handleEdit = React.useCallback((f: Formation) => {
    setEditingFormation(f);
  }, []);

  const handleDelete = React.useCallback((f: Formation) => {
    setDeletingFormation(f);
  }, []);

  const handleTogglePublish = React.useCallback(
    (f: Formation) => {
      togglePublish.mutate({ id: f.id, estPubliee: !f.estPubliee });
    },
    [togglePublish],
  );

  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={BookOpen}
          title="Erreur de chargement"
          description="Impossible de charger les formations. Veuillez réessayer."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  if (!formations.length) {
    return (
      <>
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Aucune formation"
            description="Créez votre première formation pour enrichir le catalogue ODC."
            action={
              <Button variant="odc" onClick={() => setIsCreateOpen(true)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Créer une formation
              </Button>
            }
          />
        </Card>

        <FormationFormModal
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      </>
    );
  }

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Formation</TableHead>
              <TableHead className="hidden md:table-cell">Domaine</TableHead>
              <TableHead className="hidden lg:table-cell">Niveau</TableHead>
              <TableHead className="hidden lg:table-cell">Durée</TableHead>
              <TableHead className="hidden md:table-cell text-center">
                Sessions
              </TableHead>
              <TableHead className="hidden md:table-cell text-center">
                Inscrits
              </TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {formations.map((f) => (
              <TableRow
                key={f.id}
                className="group cursor-pointer transition-colors hover:bg-odc-surface-hover"
                onClick={() => router.push(`/admin/formations/${f.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {f.imageUrl ? (
                      <img
                        src={f.imageUrl}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-odc-border"
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center',
                          'rounded-lg',
                          'bg-odc-primary-soft text-odc-primary',
                          'ring-1 ring-inset ring-black/5',
                        )}
                      >
                        <GraduationCap className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-odc-text-primary">
                        {f.titre}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="truncate font-mono text-xs text-odc-text-muted">
                          {f.slug}
                        </p>
                        {f.miseEnAvant && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                            <Award className="h-3 w-3" />
                            En avant
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {f.domaine ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
                        'text-xs font-medium ring-1 ring-inset ring-black/5',
                      )}
                      style={{
                        backgroundColor: `${f.domaine.couleur ?? '#FF7900'}20`,
                        color: f.domaine.couleur ?? '#FF7900',
                      }}
                      title={f.domaine.nom}
                    >
                      <FolderTree className="h-3 w-3" aria-hidden="true" />
                      <span className="max-w-[120px] truncate">
                        {f.domaine.nom}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-odc-text-muted">—</span>
                  )}
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <NiveauBadge niveau={f.niveau} />
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-xs text-odc-text-secondary">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="tabular-nums">{f.dureeHeures}h</span>
                  </span>
                </TableCell>

                <TableCell className="hidden md:table-cell text-center">
                  <CounterBadge
                    count={f.sessionsCount}
                    icon={Calendar}
                    label="session"
                    tone="info"
                  />
                </TableCell>

                <TableCell className="hidden md:table-cell text-center">
                  <CounterBadge
                    count={f.inscriptionsCount}
                    icon={Users}
                    label="inscription"
                    tone="success"
                  />
                </TableCell>

                <TableCell>
                  {f.estPubliee ? (
                    <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-success" />
                      Publiée
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-odc-text-muted">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-text-muted" />
                      Brouillon
                    </Badge>
                  )}
                </TableCell>

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
                        aria-label="Actions de la formation"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(f)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(f)}
                        disabled={togglePublish.isPending}
                      >
                        {f.estPubliee ? (
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
                          window.open(`/formations/${f.slug}`, '_blank')
                        }
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir la page
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-odc-error focus:bg-odc-error-soft focus:text-odc-error"
                        onClick={() => handleDelete(f)}
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

      <FormationFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <FormationFormModal
        mode="edit"
        id={editingFormation?.id}
        open={!!editingFormation}
        onOpenChange={(open) => !open && setEditingFormation(null)}
      />

      <DeleteFormationDialog
        formation={deletingFormation}
        open={!!deletingFormation}
        onOpenChange={(open) => !open && setDeletingFormation(null)}
      />
    </TooltipProvider>
  );
}