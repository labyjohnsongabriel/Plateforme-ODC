'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical, Edit, Trash2, Calendar, Users, QrCode, Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

const STATUT_LABELS: Record<string, string> = {
  PLANIFIEE: 'Planifiée',
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

const STATUT_COLORS: Record<string, string> = {
  PLANIFIEE: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  OUVERTE: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  EN_COURS: 'bg-odc-primary-soft text-odc-primary',
  TERMINEE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  ANNULEE: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export function SessionsTable() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    statut: searchParams.get('statut') ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'sessions', filters],
    queryFn: async () => {
      const { data } = await api.get('/staff/sessions', { params: filters });
      return data;
    },
  });

  const ouvrirPresenceMutation = useMutation({
    mutationFn: async ({ id, ouverte }: { id: string; ouverte: boolean }) => {
      await api.put(`/staff/sessions/${id}/ouvrir-presence`, { ouverte });
    },
    onSuccess: (_, vars) => {
      toast.success(vars.ouverte ? 'Présence ouverte' : 'Présence fermée');
      qc.invalidateQueries({ queryKey: ['staff', 'sessions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success('Session supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'sessions'] });
    },
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/staff/sessions?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </Card>
    );
  }

  const sessions = data?.data ?? [];

  return (
    <Card>
      <div className="p-4 border-b border-odc-border">
        <Select
          value={searchParams.get('statut') ?? 'all'}
          onValueChange={(v) => updateFilter('statut', v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune session" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead className="hidden lg:table-cell">Dates</TableHead>
              <TableHead className="hidden md:table-cell">Lieu</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Présence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-odc-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {s.formation?.titre}
                      </p>
                      <p className="text-xs text-odc-muted font-mono">
                        {s.codeSession}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {s.lieu || 'En ligne'}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[s.statut]}`}>
                    {STATUT_LABELS[s.statut]}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {s.presenceOuverte ? (
                    <Badge className="bg-odc-success-bg text-odc-success">Ouverte</Badge>
                  ) : (
                    <Badge variant="outline">Fermée</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => router.push(`/staff/sessions/${s.id}`)}>
                        <Edit className="h-4 w-4 mr-2" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/staff/selections/${s.id}`)}>
                        <Users className="h-4 w-4 mr-2" /> Gérer les candidats
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
                        <QrCode className="h-4 w-4 mr-2" />
                        {s.presenceOuverte ? 'Fermer présence' : 'Ouvrir présence'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-odc-error"
                        onClick={() => {
                          if (confirm('Supprimer cette session ?')) {
                            deleteMutation.mutate(s.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {data?.pagination?.totalPages > 1 && (
        <div className="p-4 border-t border-odc-border">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
          />
        </div>
      )}
    </Card>
  );
}