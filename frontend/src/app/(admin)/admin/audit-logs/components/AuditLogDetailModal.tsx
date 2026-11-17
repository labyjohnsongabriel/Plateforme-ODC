// src/app/(admin)/admin/audit-logs/components/AuditLogDetailModal.tsx
'use client';

import {
  Activity,
  Clock,
  Globe,
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
        <DialogHeader className="shrink-0 border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20"
              aria-hidden="true"
            >
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg font-bold text-foreground">
                Détail du log
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
                {log?.action ? (
                  <>
                    Action{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
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
            <p className="text-sm italic text-muted-foreground">
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
                <SectionCard title="Utilisateur">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary dark:bg-primary/15">
                      {log.user.prenom?.charAt(0)}
                      {log.user.nom?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {log.user.prenom} {log.user.nom}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {log.user.email}
                      </p>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* URL */}
              {log.url && (
                <SectionCard title="URL" icon={Globe}>
                  <code className="block break-all font-mono text-xs text-foreground">
                    {log.url}
                  </code>
                </SectionCard>
              )}

              {/* User-Agent */}
              {log.userAgent && (
                <SectionCard title="User-Agent" icon={Monitor}>
                  <p className="break-all text-xs text-muted-foreground">
                    {log.userAgent}
                  </p>
                </SectionCard>
              )}

              {/* Payload */}
              {log.payload && Object.keys(log.payload).length > 0 && (
                <SectionCard title="Payload" icon={FileJson}>
                  <pre className="scrollbar-thin overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </SectionCard>
              )}

              {/* Changes */}
              {log.changes && Object.keys(log.changes).length > 0 && (
                <SectionCard title="Modifications" icon={FileJson}>
                  <pre className="scrollbar-thin overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                </SectionCard>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {title}
      </p>
      {children}
    </div>
  );
}

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
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <Icon
          className="h-3.5 w-3.5 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={cn(
          'mt-1 text-sm font-semibold text-foreground',
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