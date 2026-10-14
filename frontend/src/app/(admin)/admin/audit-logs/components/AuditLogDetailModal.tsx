// src/app/(admin)/admin/audit-logs/components/AuditLogDetailModal.tsx
'use client';

import {
  Activity,
  Clock,
  Globe,
  User,
  Database,
  FileJson,
  Monitor,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/formatters';
import { useAuditLog } from '@/hooks/useAuditLogs';
import { AuditLogSeverityBadge } from './AuditLogSeverityBadge';

interface AuditLogDetailModalProps {
  logId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailModal({
  logId,
  open,
  onOpenChange,
}: AuditLogDetailModalProps) {
  const { data: log, isLoading } = useAuditLog(open ? logId : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {/* En-tête */}
        <DialogHeader className="shrink-0 border-b border-odc-border bg-odc-surface px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-odc-500 to-odc-700 shadow-odc-md"
              aria-hidden="true"
            >
              <Activity className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg font-bold">
                Détail du log
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm">
                {log?.action ? (
                  <>
                    Action{' '}
                    <code className="rounded bg-odc-surface-alt px-1.5 py-0.5 font-mono text-xs">
                      {log.action}
                    </code>
                  </>
                ) : (
                  'Chargement…'
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <DetailSkeleton />
          ) : !log ? (
            <p className="text-sm italic text-odc-text-muted">
              Log introuvable.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Sévérité */}
              <div className="flex items-center gap-2">
                <AuditLogSeverityBadge severite={log.severite} size="md" />
              </div>

              {/* Métadonnées */}
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Clock}
                  label="Date"
                  value={formatDateTime(log.createdAt)}
                />
                <InfoItem
                  icon={Activity}
                  label="Action"
                  value={log.action}
                  mono
                />
                {log.entite && (
                  <InfoItem
                    icon={Database}
                    label="Entité"
                    value={log.entite}
                  />
                )}
                {log.entiteId && (
                  <InfoItem
                    icon={Database}
                    label="ID Entité"
                    value={log.entiteId}
                    mono
                    truncate
                  />
                )}
                {log.methode && (
                  <InfoItem
                    icon={Globe}
                    label="Méthode"
                    value={log.methode}
                    mono
                  />
                )}
                {log.ipAddress && (
                  <InfoItem
                    icon={Globe}
                    label="Adresse IP"
                    value={log.ipAddress}
                    mono
                  />
                )}
              </div>

              {/* Utilisateur */}
              {log.user && (
                <div className="rounded-lg border border-odc-border p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                    Utilisateur
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-odc-primary-soft text-sm font-bold text-odc-primary">
                      {log.user.prenom?.charAt(0)}
                      {log.user.nom?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-odc-text-primary">
                        {log.user.prenom} {log.user.nom}
                      </p>
                      <p className="truncate text-xs text-odc-text-muted">
                        {log.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* URL */}
              {log.url && (
                <div className="rounded-lg border border-odc-border p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                    <Globe className="h-3.5 w-3.5" />
                    URL
                  </p>
                  <code className="block break-all font-mono text-xs text-odc-text-primary">
                    {log.url}
                  </code>
                </div>
              )}

              {/* User-Agent */}
              {log.userAgent && (
                <div className="rounded-lg border border-odc-border p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                    <Monitor className="h-3.5 w-3.5" />
                    User-Agent
                  </p>
                  <p className="break-all text-xs text-odc-text-secondary">
                    {log.userAgent}
                  </p>
                </div>
              )}

              {/* Payload */}
              {log.payload && Object.keys(log.payload).length > 0 && (
                <div className="rounded-lg border border-odc-border p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                    <FileJson className="h-3.5 w-3.5" />
                    Payload
                  </p>
                  <pre className="scrollbar-thin overflow-x-auto rounded-md bg-odc-surface-alt p-3 font-mono text-xs text-odc-text-primary">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Changes */}
              {log.changes && Object.keys(log.changes).length > 0 && (
                <div className="rounded-lg border border-odc-border p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                    <FileJson className="h-3.5 w-3.5" />
                    Modifications
                  </p>
                  <pre className="scrollbar-thin overflow-x-auto rounded-md bg-odc-surface-alt p-3 font-mono text-xs text-odc-text-primary">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
   SOUS-COMPOSANTS
   ============================================================================ */

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono,
  truncate,
}: InfoItemProps) {
  return (
    <div className="rounded-lg border border-odc-border p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-odc-text-muted" />
        <p className="text-xs font-medium text-odc-text-muted">{label}</p>
      </div>
      <p
        className={cn(
          'mt-1 text-sm font-semibold text-odc-text-primary',
          mono && 'font-mono text-xs',
          truncate && 'truncate',
        )}
        title={truncate ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );
}