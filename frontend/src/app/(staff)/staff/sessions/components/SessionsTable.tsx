// src/app/(staff)/staff/sessions/components/SessionsTable.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Users,
  QrCode,
  Eye,
  Plus,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  MapPin,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { SessionFormModal } from './SessionFormModal';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Session {
  id: string;
  codeSession: string;
  dateDebut: string;
  dateFin?: string;
  lieu?: string | null;
  capacite: number;
  statut: string;
  presenceOuverte?: boolean;
  inscriptionsCount?: number;
  formation?: { titre?: string | null } | null;
}

interface SessionsResponse {
  data: Session[];
  pagination?: { page: number; totalPages: number; total?: number };
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  PLANIFIEE: {
    label: 'Planifiée',
    icon: Clock,
    className:
      'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  },
  OUVERTE: {
    label: 'Ouverte',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  EN_COURS: {
    label: 'En cours',
    icon: PlayCircle,
    className:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  TERMINEE: {
    label: 'Terminée',
    icon: CheckCircle2,
    className: 'bg-muted text-muted-foreground border border-border',
  },
  ANNULEE: {
    label: 'Annulée',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractSessions(response: unknown): SessionsResponse {
  if (!response || typeof response !== 'object') return { data: [] };
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;

  const rawList =
    (Array.isArray(root.sessions) && root.sessions) ||
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root) && root) ||
    [];

  const sessions = (rawList as unknown[])
    .filter((s): s is Session => s != null && typeof s === 'object' && 'id' in s)
    .filter((s) => typeof s.id === 'string' && s.id.length > 0);

  return {
    data: sessions,
    pagination: (root.pagination as SessionsResponse['pagination']) ?? undefined,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SessionsTable() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

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

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    statut: searchParams.get('statut') ?? undefined,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery<SessionsResponse>({
    queryKey: ['staff', 'sessions', filters],
    queryFn: async () => {
      const response = await api.get('/staff/sessions', { params: filters });
      return extractSessions(response.data);
    },
    staleTime: 30_000,
  });

  const ouvrirPresenceMutation = useMutation({
    mutationFn: async ({ id, ouverte }: { id: string; ouverte: boolean }) => {
      await api.put(`/staff/sessions/${id}/ouvrir-presence`, { ouverte });
    },
    onSuccess: (_, vars) => {
      toast.success(vars.ouverte ? 'Présence ouverte' : 'Présence fermée');
      qc.invalidateQueries({ queryKey: ['staff', 'sessions'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success('Session supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'sessions'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/staff/sessions?${params.toString()}`, { scroll: false });
  };

  /* Header commun */
  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Sessions
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gérez les sessions de formation
        </p>
      </div>
      <Button
        onClick={openCreate}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        Nouvelle session
      </Button>
    </header>
  );

  /* Loading */
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
        <SessionFormModal open={modalOpen} onOpenChange={closeModal} sessionId={editId} />
      </div>
    );
  }

  /* Erreur */
  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
          </CardContent>
        </Card>
        <SessionFormModal open={modalOpen} onOpenChange={closeModal} sessionId={editId} />
      </div>
    );
  }

  const sessions = data?.data ?? [];

  /* Vide */
  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Calendar}
              title="Aucune session"
              description="Créez votre première session de formation."
              action={
                <Button
                  onClick={openCreate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Créer une session
                </Button>
              }
            />
          </CardContent>
        </Card>
        <SessionFormModal open={modalOpen} onOpenChange={closeModal} sessionId={editId} />
      </div>
    );
  }

  /* Rendu principal */
  return (
    <div className="space-y-6">
      {header}

      <Card>
        {/* Filtre */}
        <div className="border-b border-border p-4">
          <Select
            value={searchParams.get('statut') ?? 'all'}
            onValueChange={(v) => updateFilter('statut', v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUT_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Session</TableHead>
                <TableHead className="hidden lg:table-cell">Dates</TableHead>
                <TableHead className="hidden md:table-cell">Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Présence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => {
                const config = STATUT_CONFIG[s.statut] ?? STATUT_CONFIG.PLANIFIEE;
                const StatusIcon = config.icon;

                return (
                  <TableRow key={s.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15">
                          <Calendar className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {s.formation?.titre ?? 'Sans titre'}
                          </p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {s.codeSession}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      <span className="tabular-nums">
                        {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                      </span>
                    </TableCell>

                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="truncate">{s.lieu || 'En ligne'}</span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          config.className,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" aria-hidden="true" />
                        {config.label}
                      </span>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {s.presenceOuverte ? (
                        <Badge className="gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <QrCode className="h-3 w-3" aria-hidden="true" />
                          Ouverte
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Fermée
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-foreground group-hover:opacity-100"
                            aria-label={`Actions pour ${s.codeSession}`}
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => openEdit(s.id)}>
                            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/staff/sessions/${s.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/staff/selections/${s.id}`)}
                          >
                            <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                            Gérer les candidats
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              ouvrirPresenceMutation.mutate({
                                id: s.id,
                                ouverte: !s.presenceOuverte,
                              })
                            }
                          >
                            <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                            {s.presenceOuverte ? 'Fermer présence' : 'Ouvrir présence'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Supprimer la session "${s.codeSession}" ?`)) {
                                deleteMutation.mutate(s.id);
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

      <SessionFormModal open={modalOpen} onOpenChange={closeModal} sessionId={editId} />
    </div>
  );
}