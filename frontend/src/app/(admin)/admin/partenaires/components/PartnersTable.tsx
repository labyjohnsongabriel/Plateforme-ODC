'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical, Edit, Trash2, Eye, EyeOff, Building2, Globe, Mail,
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
import { api } from '@/lib/api';

export function PartnersTable() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'partenaires', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/partenaires', { params: filters });
      return data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, estPubliee }: { id: string; estPubliee: boolean }) => {
      await api.put(`/admin/partenaires/${id}/publier`, { estPubliee });
    },
    onSuccess: () => {
      toast.success('Publication mise à jour');
      qc.invalidateQueries({ queryKey: ['admin', 'partenaires'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/partenaires/${id}`);
    },
    onSuccess: () => {
      toast.success('Partenaire supprimé');
      qc.invalidateQueries({ queryKey: ['admin', 'partenaires'] });
    },
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

  const partenaires = data?.data ?? [];

  if (!partenaires.length) {
    return (
      <Card>
        <EmptyState icon={Building2} title="Aucun partenaire" />
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partenaire</TableHead>
            <TableHead className="hidden md:table-cell">Secteur</TableHead>
            <TableHead className="hidden lg:table-cell">Contact</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partenaires.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-contain bg-odc-surface-alt"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-odc-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.nom}</p>
                    <p className="text-xs text-odc-muted truncate font-mono">
                      {p.slug}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell text-sm">
                {p.secteur ?? '—'}
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm">
                {p.contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-odc-muted" />
                    {p.contactEmail}
                  </span>
                )}
              </TableCell>

              <TableCell>
                {p.estPubliee ? (
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
                      onClick={() => router.push(`/admin/partenaires/${p.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        publishMutation.mutate({ id: p.id, estPubliee: !p.estPubliee })
                      }
                    >
                      {p.estPubliee ? (
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
                    {p.siteWeb && (
                      <DropdownMenuItem asChild>
                        <a href={p.siteWeb} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Visiter le site
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-odc-error"
                      onClick={() => {
                        if (confirm(`Supprimer ${p.nom} ?`)) {
                          deleteMutation.mutate(p.id);
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