'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function NotesTable() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    evaluationId: searchParams.get('evaluationId') ?? undefined,
    participantId: searchParams.get('participantId') ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'notes', filters],
    queryFn: async () => {
      const { data } = await api.get('/staff/notes', { params: filters });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/notes/${id}`);
    },
    onSuccess: () => {
      toast.success('Note supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'notes'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)}
      </Card>
    );
  }

  const notes = data?.data ?? [];

  if (!notes.length) {
    return <Card><EmptyState icon={FileText} title="Aucune note" /></Card>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead className="hidden md:table-cell">Évaluation</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="hidden lg:table-cell">Commentaire</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((n: any) => (
            <TableRow key={n.id}>
              <TableCell>
                <p className="font-medium text-sm">
                  {n.participant?.prenom} {n.participant?.nom}
                </p>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {n.evaluation?.titre}
              </TableCell>
              <TableCell>
                <span className="font-display font-bold text-lg text-odc-primary">
                  {n.note}
                </span>
                <span className="text-xs text-odc-muted ml-1">
                  / {n.evaluation?.noteMax}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-odc-muted max-w-xs truncate">
                {n.commentaire ?? '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-odc-error hover:bg-odc-error-bg hover:text-odc-error"
                  onClick={() => {
                    if (confirm('Supprimer cette note ?')) deleteMutation.mutate(n.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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