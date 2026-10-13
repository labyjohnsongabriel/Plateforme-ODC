'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Award, Download, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

export function AttestationsTable() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'attestations'],
    queryFn: async () => {
      const { data } = await api.get('/staff/attestations', {
        params: { limit: 100 },
      });
      return data;
    },
  });

  const invalidateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/attestations/${id}`);
    },
    onSuccess: () => {
      toast.success('Attestation invalidée');
      qc.invalidateQueries({ queryKey: ['staff', 'attestations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const download = async (id: string, numero: string) => {
    try {
      const response = await api.get(`/staff/attestations/${id}/telecharger`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)}
      </Card>
    );
  }

  const attestations = data?.data ?? [];

  if (!attestations.length) {
    return <Card><EmptyState icon={Award} title="Aucune attestation" /></Card>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead className="hidden md:table-cell">Formation</TableHead>
            <TableHead className="hidden lg:table-cell">Émise le</TableHead>
            <TableHead>Valide</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attestations.map((a: any) => (
            <TableRow key={a.id}>
              <TableCell className="font-mono text-xs">{a.numero}</TableCell>
              <TableCell>
                <p className="font-medium text-sm">
                  {a.participant?.prenom} {a.participant?.nom}
                </p>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {a.session?.formation?.titre}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-odc-muted">
                {formatDate(a.dateEmission)}
              </TableCell>
              <TableCell>
                {a.valide ? (
                  <Badge className="bg-odc-success-bg text-odc-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Valide
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-odc-error">
                    <XCircle className="h-3 w-3 mr-1" /> Invalide
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => download(a.id, a.numero)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <a
                    href={`/verifier-attestation/${a.numero}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}