'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Activity, User, Globe, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/formatters';

export function AuditLogsTable() {
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    action: searchParams.get('action') ?? undefined,
    entite: searchParams.get('entite') ?? undefined,
    dateDebut: searchParams.get('dateDebut') ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/audit-logs', { params: filters });
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 mb-2" />
        ))}
      </Card>
    );
  }

  const logs = data?.data ?? [];

  if (!logs.length) {
    return (
      <Card>
        <EmptyState
          icon={Activity}
          title="Aucun log d'audit"
          description="Aucune activité enregistrée avec ces filtres."
        />
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="hidden md:table-cell">Entité</TableHead>
            <TableHead className="hidden lg:table-cell">Utilisateur</TableHead>
            <TableHead className="hidden xl:table-cell">IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log: any) => (
            <TableRow key={log.id}>
              <TableCell>
                <span className="flex items-center gap-1.5 text-xs text-odc-muted">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(log.createdAt)}
                </span>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs font-medium">
                  {log.action}
                </span>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="text-xs">
                  {log.entite ?? '—'}
                </Badge>
                {log.entiteId && (
                  <p className="text-xs text-odc-muted font-mono mt-0.5 truncate max-w-[120px]">
                    {log.entiteId.slice(0, 8)}…
                  </p>
                )}
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                {log.userId ? (
                  <span className="flex items-center gap-1.5 text-xs">
                    <User className="h-3 w-3 text-odc-muted" />
                    {log.userId.slice(0, 8)}…
                  </span>
                ) : (
                  <span className="text-xs text-odc-muted">Système</span>
                )}
              </TableCell>

              <TableCell className="hidden xl:table-cell text-xs text-odc-muted font-mono">
                {log.ipAddress ? (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3" />
                    {log.ipAddress}
                  </span>
                ) : (
                  '—'
                )}
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