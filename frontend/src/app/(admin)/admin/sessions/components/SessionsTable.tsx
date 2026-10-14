// src/app/(admin)/admin/sessions/components/SessionsTable.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CalendarClock,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import {
  useSessions,
  useChangeSessionStatut,
  useTogglePresenceSession,
  type Session,
  type StatutSession,
} from '@/hooks/useSessions';
import { SessionFormModal } from './SessionFormModal';
import { DeleteSessionDialog } from './DeleteSessionDialog';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const STATUT_LABELS: Record<StatutSession, string> = {
  PLANIFIEE: 'Planifiée',
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

const STATUT_COLORS: Record<StatutSession, string> = {
  PLANIFIEE: 'bg-blue-50 text-blue-700 ring-blue-200',
  OUVERTE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  EN_COURS: 'bg-odc-primary-soft text-odc-primary-active ring-odc-primary-light/40',
  TERMINEE: 'bg-odc-surface-alt text-odc-text-secondary ring-odc-border',
  ANNULEE: 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
};

function StatutBadge({ statut }: { statut: StatutSession }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        STATUT_COLORS[statut],
      )}
    >
      {STATUT_LABELS[statut]}
    </span>
  );
}

/* ============================================================================
   COMPTEUR CAPACITÉ
   ============================================================================ */

function CapaciteBadge({ count, capacite }: { count: number; capacite: number }) {
  const ratio = capacite > 0 ? count / capacite : 0;
  const full = ratio >= 1;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
            'text-xs font-semibold tabular-nums ring-1 ring-inset',
            full
              ? 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30'
              : 'bg-odc-primary-soft text-odc-primary-active ring-odc-primary-light/40',
          )}
        >
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {count}/{capacite}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {count} inscrit{count > 1 ? 's' : ''} sur {capacite} place
        {capacite > 1 ? 's' : ''}
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
   COMPOSANT
   ============================================================================ */

export function SessionsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    statut: (searchParams.get('statut') as StatutSession | 'all') ?? 'all',
    formationId: searchParams.get('formationId') ?? undefined,
  };

  const { data, isLoading, isError } = useSessions(filters);
  const changeStatut = useChangeSessionStatut();
  const togglePresence = useTogglePresenceSession();

  const [editingSession, setEditingSession] = React.useState<Session | null>(
    null,
  );
  const [deletingSession, setDeletingSession] = React.useState<Session | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/admin/sessions?${params.toString()}`, { scroll: false });
  };

  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={Calendar}
          title="Erreur de chargement"
          description="Impossible de charger les sessions."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  const sessions = data?.data ?? [];

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3 border-b border-odc-border p-4">
          <Select
            value={searchParams.get('statut') ?? 'all'}
            onValueChange={(v) => updateFilter('statut', v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {(Object.keys(STATUT_LABELS) as StatutSession[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {STATUT_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucune session"
            description="Créez votre première session de formation."
            action={
              <Button variant="odc" onClick={() => setIsCreateOpen(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Créer une session
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Session</TableHead>
                <TableHead className="hidden lg:table-cell">Dates</TableHead>
                <TableHead className="hidden md:table-cell">Lieu</TableHead>
                <TableHead className="hidden lg:table-cell text-center">
                  Inscrits
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Présence</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sessions.map((s) => (
                <TableRow
                  key={s.id}
                  className="group cursor-pointer transition-colors hover:bg-odc-surface-hover"
                  onClick={() => router.push(`/admin/sessions/${s.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-odc-primary-soft">
                        <Calendar className="h-5 w-5 text-odc-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-odc-text-primary">
                          {s.formation?.titre ?? 'Session'}
                        </p>
                        <p className="truncate font-mono text-xs text-odc-text-muted">
                          {s.codeSession}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-xs">
                    <div className="flex items-center gap-1.5 text-odc-text-secondary">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatDate(s.dateDebut)}
                      <span className="text-odc-text-muted">→</span>
                      {formatDate(s.dateFin)}
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-xs">
                    <div className="flex items-center gap-1.5 text-odc-text-secondary">
                      <MapPin className="h-3.5 w-3.5" />
                      {s.lieu || 'En ligne'}
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-center">
                    <CapaciteBadge
                      count={s.inscriptionsCount}
                      capacite={s.capacite}
                    />
                  </TableCell>

                  <TableCell>
                    <StatutBadge statut={s.statut} />
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {s.presenceOuverte ? (
                      <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-success" />
                        Ouverte
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-odc-text-muted">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-text-muted" />
                        Fermée
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
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => setEditingSession(s)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            changeStatut.mutate({
                              id: s.id,
                              statut: 'OUVERTE',
                            })
                          }
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Marquer ouverte
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            changeStatut.mutate({
                              id: s.id,
                              statut: 'EN_COURS',
                            })
                          }
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Marquer en cours
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            changeStatut.mutate({
                              id: s.id,
                              statut: 'TERMINEE',
                            })
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marquer terminée
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            changeStatut.mutate({
                              id: s.id,
                              statut: 'ANNULEE',
                            })
                          }
                          className="text-odc-error"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Annuler la session
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            togglePresence.mutate({
                              id: s.id,
                              ouverte: !s.presenceOuverte,
                            })
                          }
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          {s.presenceOuverte
                            ? 'Fermer la présence'
                            : 'Ouvrir la présence'}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-odc-error focus:bg-odc-error-soft focus:text-odc-error"
                          onClick={() => setDeletingSession(s)}
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
        )}
      </Card>

      {/* Modales */}
      <SessionFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <SessionFormModal
        mode="edit"
        id={editingSession?.id}
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
      />

      <DeleteSessionDialog
        session={deletingSession}
        open={!!deletingSession}
        onOpenChange={(open) => !open && setDeletingSession(null)}
      />
    </TooltipProvider>
  );
}