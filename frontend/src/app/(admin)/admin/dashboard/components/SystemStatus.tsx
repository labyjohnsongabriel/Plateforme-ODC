// src/app/(admin)/admin/dashboard/components/SystemStatus.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  CircleHelp,
  Database,
  Server,
  Activity,
  Wifi,
  HardDrive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { QueryErrorState } from '@/components/shared/QueryErrorState';

interface SystemStatus {
  database: boolean;
  api: boolean;
  socket: boolean | null;
  storage: number | null;
  uptime: number;
  version: string;
}

export function SystemStatus() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<SystemStatus>({
    queryKey: ['admin', 'dashboard', 'system-status'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/status');
      return data.data;
    },
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">État du système</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState
            onRetry={() => { void refetch(); }}
            isRetrying={isFetching}
            description="L’état des services n’est pas disponible. Aucune disponibilité n’est présumée."
          />
        </CardContent>
      </Card>
    );
  }

  const status = data;
  const uptime = formatUptime(status.uptime);

  const services = [
    { name: 'Base de données', ok: status.database, icon: Database },
    { name: 'API', ok: status.api, icon: Server },
    { name: 'Socket.IO', ok: status.socket, icon: Wifi },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">État du système</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Services */}
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{s.name}</span>
              </div>
              {s.ok === null ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CircleHelp className="h-4 w-4" aria-hidden="true" />
                  Non surveillé
                </span>
              ) : s.ok ? (
                <CheckCircle2
                  className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                  aria-label="Opérationnel"
                />
              ) : (
                <XCircle
                  className="h-4 w-4 text-destructive"
                  aria-label="Indisponible"
                />
              )}
            </div>
          );
        })}

        {/* Stockage */}
        {status.storage !== null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <HardDrive className="h-3 w-3" aria-hidden="true" />
                Stockage
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {status.storage}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full transition-all',
                  status.storage > 80
                    ? 'bg-destructive'
                    : status.storage > 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500',
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, status.storage))}%`,
                }}
                role="progressbar"
                aria-valuenow={status.storage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Utilisation du stockage"
              />
            </div>
          </div>
        )}

        {/* Info système */}
        <div className="space-y-1.5 border-t border-border pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Uptime</span>
            <span className="font-medium tabular-nums text-foreground">{uptime}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono font-medium text-foreground">
              v{status.version}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `${seconds}s`;
}