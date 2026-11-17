// src/app/(admin)/admin/audit-logs/components/AuditLogsTable.tsx
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Activity,
  User,
  Globe,
  Clock,
  Eye,
  Database,
  Download,
  Loader2,
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
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/formatters';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLogSeverityBadge } from './AuditLogSeverityBadge';
import { AuditLogDetailModal } from './AuditLogDetailModal';

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════════════════════════ */

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AuditLogsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  /* ─── Filtres URL ─── */
  const filters = React.useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: 20,
      action: searchParams.get('action') ?? undefined,
      entite: searchParams.get('entite') ?? undefined,
      severite: (searchParams.get('severite') as any) ?? undefined,
      dateDebut: searchParams.get('dateDebut') ?? undefined,
      dateFin: searchParams.get('dateFin') ?? undefined,
    }),
    [searchParams],
  );

  /* ─── Query ─── */
  const { data, isLoading, isError, refetch, isFetching } =
    useAuditLogs(filters);

  /* ─── Export CSV ─── */
  const handleExportCsv = React.useCallback(async () => {
    const logs = data?.data ?? [];
    if (!logs.length) return;

    setIsExporting(true);
    try {
      const headers = [
        'Date',
        'Action',
        'Sévérité',
        'Entité',
        'Utilisateur',
        'IP',
      ];
      const rows = logs.map((l) => [
        formatDateTime(l.createdAt),
        l.action,
        l.severite,
        l.entite ?? '',
        l.user?.email ?? l.userId ?? 'Système',
        l.ipAddress ?? '',
      ]);

      // BOM UTF-8 pour Excel
      const csv =
        '\uFEFF' +
        [
          headers.join(','),
          ...rows.map((r) =>
            r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','),
          ),
        ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [data]);

  /* ─── Loading ─── */
  if (isLoading) return <TableSkeleton />;

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <QueryErrorState
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  const logs = data?.data ?? [];

  /* ─── Vide ─── */
  if (!logs.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Activity}
            title="Aucun log d'audit"
            description="Aucune activité enregistrée avec ces filtres."
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Rendu ─── */
  return (
    <>
      <Card className="overflow-hidden">
        {/* Header avec compteur + export */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {data?.pagination?.total ?? logs.length}
            </span>{' '}
            entrée{(data?.pagination?.total ?? logs.length) > 1 ? 's' : ''}{' '}
            trouvée{(data?.pagination?.total ?? logs.length) > 1 ? 's' : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExportCsv()}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2
                className="mr-1.5 h-3.5 w-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            )}
            Exporter CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[160px]">Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Entité</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Utilisateur
                </TableHead>
                <TableHead className="hidden xl:table-cell">IP</TableHead>
                <TableHead className="w-[80px] text-right">Détails</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="group cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => setSelectedLogId(log.id)}
                >
                  {/* Date */}
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {formatDateTime(log.createdAt)}
                    </span>
                  </TableCell>

                  {/* Action + sévérité */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AuditLogSeverityBadge
                        severite={log.severite}
                        showLabel={false}
                      />
                      <span className="truncate font-mono text-xs font-semibold text-foreground">
                        {log.action}
                      </span>
                    </div>
                  </TableCell>

                  {/* Entité */}
                  <TableCell className="hidden md:table-cell">
                    {log.entite ? (
                      <div>
                        <Badge variant="outline" className="text-xs">
                          <Database
                            className="mr-1 h-3 w-3"
                            aria-hidden="true"
                          />
                          {log.entite}
                        </Badge>
                        {log.entiteId && (
                          <p
                            className="mt-0.5 truncate font-mono text-xs text-muted-foreground"
                            title={log.entiteId}
                          >
                            {log.entiteId.slice(0, 8)}…
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Utilisateur */}
                  <TableCell className="hidden lg:table-cell">
                    {log.user ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <User
                          className="h-3 w-3 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="truncate text-foreground">
                          {log.user.prenom} {log.user.nom}
                        </span>
                      </span>
                    ) : log.userId ? (
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <User
                          className="h-3 w-3 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground">
                          {log.userId.slice(0, 8)}…
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Système
                      </span>
                    )}
                  </TableCell>

                  {/* IP */}
                  <TableCell className="hidden xl:table-cell">
                    {log.ipAddress ? (
                      <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {log.ipAddress}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLogId(log.id)}
                      className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                      aria-label="Voir les détails"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      {/* Modal détail */}
      <AuditLogDetailModal
        logId={selectedLogId ?? undefined}
        open={!!selectedLogId}
        onOpenChange={(open) => !open && setSelectedLogId(null)}
      />
    </>
  );
}