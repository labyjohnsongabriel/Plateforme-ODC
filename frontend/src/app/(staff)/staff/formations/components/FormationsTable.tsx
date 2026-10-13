'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical, Edit, Trash2, BookOpen, Eye, EyeOff, Clock,
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
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { PublicationToggle } from './PublicationToggle';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

export function FormationsTable() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    q: searchParams.get('q') ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'formations', filters],
    queryFn: async () => {
      const { data } = await api.get('/staff/formations', { params: filters });
      return data;
    },
  });

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

  const formations = data?.data ?? [];

  if (!formations.length) {
    return (
      <Card>
        <EmptyState
          icon={BookOpen}
          title="Aucune formation"
          description="Créez votre première formation au catalogue."
        />
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Formation</TableHead>
            <TableHead className="hidden md:table-cell">Domaine</TableHead>
            <TableHead className="hidden lg:table-cell">Niveau</TableHead>
            <TableHead className="hidden lg:table-cell">Durée</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formations.map((f: any) => (
            <TableRow key={f.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-odc-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{f.titre}</p>
                    <p className="text-xs text-odc-muted font-mono truncate">
                      {f.slug}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">
                  {f.domaineRelation?.nom ?? f.domaine}
                </Badge>
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm">
                {NIVEAU_LABELS[f.niveau]}
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-odc-muted" />
                  {f.dureeHeures}h
                </span>
              </TableCell>

              <TableCell>
                <PublicationToggle
                  formationId={f.id}
                  estPubliee={f.estPubliee}
                  onToggle={() =>
                    qc.invalidateQueries({ queryKey: ['staff', 'formations'] })
                  }
                />
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/staff/formations/${f.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-odc-error focus:text-odc-error"
                      onClick={() => {
                        if (confirm(`Supprimer ${f.titre} ?`)) {
                          deleteMutation.mutate(f.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
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
  );
}