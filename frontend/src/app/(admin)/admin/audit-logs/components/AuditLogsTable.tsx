// src/app/(admin)/admin/audit-logs/components/AuditLogsTable.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  User,
  Globe,
  Clock,
  Eye,
  Database,
  Download,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/formatters';
import { useAuditLogs, type AuditLog } from '@/hooks/useAuditLogs';
import { AuditLogSeverityBadge } from './AuditLogSeverityBadge';
import { AuditLogDetailModal } from './AuditLogDetailModal';

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-odc-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function AuditLogsTable() {
  const searchParams = useSearchParams();
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(
    null,
  );

  /* -------------------- Filtres URL -------------------- */
  const filters = React.useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: 20,
      action: searchParams.get('action') ?? undefined,
      entite: searchParams.get('entite') ?? undefined,
      severite:
        (searchParams.get('severite') as any) ?? undefined,
      dateDebut: searchParams.get('dateDebut') ?? undefined,
      dateFin: searchParams.get('dateFin') ?? undefined,
    }),
    [searchParams],
  );

  /* -------------------- Query -------------------- */
  const { data, isLoading, isError } = useAuditLogs(filters);

  /* -------------------- Loading -------------------- */
  if (isLoading) return <TableSkeleton />;

  /* -------------------- Erreur -------------------- */
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={Activity}
          title="Erreur de chargement"
          description="Impossible de charger les logs d'audit."
          action={
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  const logs = data?.data ?? [];

  /* -------------------- Vide -------------------- */
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

  /* -------------------- Export CSV -------------------- */
  const handleExportCsv = () => {
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

    const csv = [
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
  };

  /* -------------------- Rendu -------------------- */
  return (
    <>
      <Card className="overflow-hidden">
        {/* En-tête avec export */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-odc-border bg-odc-surface-alt/30 p-3">
          <p className="text-xs text-odc-text-muted">
            {data?.pagination?.total ?? logs.length} entrée(s) trouvée(s)
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Exporter CSV
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden md:table-cell">Entité</TableHead>
              <TableHead className="hidden lg:table-cell">Utilisateur</TableHead>
              <TableHead className="hidden xl:table-cell">IP</TableHead>
              <TableHead className="w-[80px] text-right">Détails</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="group cursor-pointer transition-colors hover:bg-odc-surface-hover"
                onClick={() => setSelectedLogId(log.id)}
              >
                {/* Date */}
                <TableCell>
                  <span className="flex items-center gap-1.5 text-xs text-odc-text-muted">
                    <Clock className="h-3 w-3 shrink-0" />
                    {formatDateTime(log.createdAt)}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AuditLogSeverityBadge
                      severite={log.severite}
                      showLabel={false}
                    />
                    <span className="truncate font-mono text-xs font-semibold text-odc-text-primary">
                      {log.action}
                    </span>
                  </div>
                </TableCell>

                {/* Entité */}
                <TableCell className="hidden md:table-cell">
                  {log.entite ? (
                    <div>
                      <Badge variant="outline" className="text-xs">
                        <Database className="mr-1 h-3 w-3" />
                        {log.entite}
                      </Badge>
                      {log.entiteId && (
                        <p
                          className="mt-0.5 truncate font-mono text-xs text-odc-text-muted"
                          title={log.entiteId}
                        >
                          {log.entiteId.slice(0, 8)}…
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-odc-text-muted">—</span>
                  )}
                </TableCell>

                {/* Utilisateur */}
                <TableCell className="hidden lg:table-cell">
                  {log.user ? (
                    <span className="flex items-center gap-1.5 text-xs">
                      <User className="h-3 w-3 shrink-0 text-odc-text-muted" />
                      <span className="truncate">
                        {log.user.prenom} {log.user.nom}
                      </span>
                    </span>
                  ) : log.userId ? (
                    <span className="flex items-center gap-1.5 font-mono text-xs">
                      <User className="h-3 w-3 shrink-0 text-odc-text-muted" />
                      {log.userId.slice(0, 8)}…
                    </span>
                  ) : (
                    <span className="text-xs text-odc-text-muted">Système</span>
                  )}
                </TableCell>

                {/* IP */}
                <TableCell className="hidden xl:table-cell">
                  {log.ipAddress ? (
                    <span className="flex items-center gap-1.5 font-mono text-xs text-odc-text-muted">
                      <Globe className="h-3 w-3 shrink-0" />
                      {log.ipAddress}
                    </span>
                  ) : (
                    <span className="text-xs text-odc-text-muted">—</span>
                  )}
                </TableCell>

                {/* Détails */}
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedLogId(log.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-odc-border p-4">
            <p className="text-xs text-odc-text-muted">
              Page {data.pagination.page} sur {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const p = Math.max(1, (data.pagination.page ?? 1) - 1);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(p));
                  window.location.href = `/admin/audit-logs?${params.toString()}`;
                }}
                disabled={data.pagination.page <= 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const p = Math.min(
                    data.pagination.totalPages,
                    (data.pagination.page ?? 1) + 1,
                  );
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(p));
                  window.location.href = `/admin/audit-logs?${params.toString()}`;
                }}
                disabled={
                  data.pagination.page >= data.pagination.totalPages
                }
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modale de détail */}
      <AuditLogDetailModal
        logId={selectedLogId ?? undefined}
        open={!!selectedLogId}
        onOpenChange={(open) => !open && setSelectedLogId(null)}
      />
    </>
  );
}