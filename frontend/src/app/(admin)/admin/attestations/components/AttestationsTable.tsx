'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Award, Download, ExternalLink, CheckCircle2, XCircle, Hash,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

export function AttestationsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    sessionId: searchParams.get('sessionId') ?? undefined,
    valide: searchParams.get('valide') ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'attestations', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/attestations', { params: filters });
      return data;
    },
  });

  const download = async (id: string, numero: string) => {
    try {
      const response = await api.get(`/admin/attestations/${id}/telecharger`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 mb-2" />
        ))}
      </Card>
    );
  }

  const attestations = data?.data ?? [];

  if (!attestations.length) {
    return (
      <Card>
        <EmptyState
          icon={Award}
          title="Aucune attestation"
          description="Générez des attestations depuis une session."
        />
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead className="hidden md:table-cell">Formation</TableHead>
            <TableHead className="hidden lg:table-cell">Note</TableHead>
            <TableHead className="hidden lg:table-cell">Émise le</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attestations.map((a: any) => (
            <TableRow key={a.id}>
              <TableCell>
                <span className="font-mono text-xs flex items-center gap-1.5">
                  <Hash className="h-3 w-3 text-odc-muted" />
                  {a.numero}
                </span>
              </TableCell>

              <TableCell>
                <p className="font-medium text-sm">
                  {a.participant?.prenom} {a.participant?.nom}
                </p>
                <p className="text-xs text-odc-muted">{a.participant?.email}</p>
              </TableCell>

              <TableCell className="hidden md:table-cell text-sm">
                {a.session?.formation?.titre}
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm">
                {a.noteFinale}/20
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm text-odc-muted">
                {formatDate(a.dateEmission)}
              </TableCell>

              <TableCell>
                {a.valide ? (
                  <Badge className="bg-odc-success-bg text-odc-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Valide
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-odc-error">
                    <XCircle className="h-3 w-3 mr-1" />
                    Invalide
                  </Badge>
                )}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => download(a.id, a.numero)}
                  aria-label="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                  aria-label="Vérifier"
                >
                  <a
                    href={`/verifier-attestation/${a.numero}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
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