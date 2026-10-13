'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreVertical, Edit, Trash2, Eye, EyeOff, FolderTree } from 'lucide-react';
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
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function DomainesTable() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'domaines'],
    queryFn: async () => {
      const { data } = await api.get('/admin/domaines');
      return data.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, estPubliee }: { id: string; estPubliee: boolean }) => {
      await api.put(`/admin/domaines/${id}/publier`, { estPubliee });
    },
    onSuccess: (_, vars) => {
      toast.success(vars.estPubliee ? 'Publié' : 'Dépublié');
      qc.invalidateQueries({ queryKey: ['admin', 'domaines'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/domaines/${id}`);
    },
    onSuccess: () => {
      toast.success('Domaine supprimé');
      qc.invalidateQueries({ queryKey: ['admin', 'domaines'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 mb-2" />
        ))}
      </Card>
    );
  }

  const domaines = data ?? [];

  if (!domaines.length) {
    return (
      <Card>
        <EmptyState
          icon={FolderTree}
          title="Aucun domaine"
          description="Créez votre premier domaine de formation."
        />
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domaine</TableHead>
            <TableHead className="hidden md:table-cell">Formations</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domaines.map((d: any) => (
            <TableRow key={d.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {d.imageUrl ? (
                    <img
                      src={d.imageUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{
                        backgroundColor: d.couleur ? `${d.couleur}20` : 'var(--odc-primary-soft)',
                      }}
                    >
                      📚
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{d.nom}</p>
                    <p className="text-xs text-odc-muted font-mono">{d.slug}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell text-sm">
                {d.formations?.length ?? 0}
              </TableCell>

              <TableCell>
                {d.estPubliee ? (
                  <Badge className="bg-odc-success-bg text-odc-success">
                    Publié
                  </Badge>
                ) : (
                  <Badge variant="outline">Brouillon</Badge>
                )}
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
                      onClick={() => router.push(`/admin/domaines/${d.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        publishMutation.mutate({ id: d.id, estPubliee: !d.estPubliee })
                      }
                    >
                      {d.estPubliee ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Dépublier
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publier
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-odc-error focus:text-odc-error"
                      onClick={() => {
                        if (confirm(`Supprimer ${d.nom} ?`)) {
                          deleteMutation.mutate(d.id);
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
    </Card>
  );
}