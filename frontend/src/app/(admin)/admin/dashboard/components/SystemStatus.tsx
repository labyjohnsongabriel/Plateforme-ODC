// src/app/(admin)/admin/dashboard/components/SystemStatus.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
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

interface SystemStatus {
  database: boolean;
  api: boolean;
  socket: boolean;
  storage: number; // % utilisé
  uptime: number; // secondes
  version: string;
}

export function SystemStatus() {
  const { data, isLoading } = useQuery<SystemStatus>({
    queryKey: ['admin', 'dashboard', 'system-status'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/status');
      return data.data;
    },
    refetchInterval: 30_000, // Rafraîchir toutes les 30s
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

  const status = data ?? {
    database: true,
    api: true,
    socket: true,
    storage: 45,
    uptime: 0,
    version: '1.0.0',
  };

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
          <Activity className="h-4 w-4 text-odc-primary" />
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
              className="flex items-center justify-between p-2 rounded-lg bg-odc-surface-alt/50"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-odc-muted" />
                <span className="text-sm">{s.name}</span>
              </div>
              {s.ok ? (
                <CheckCircle2 className="h-4 w-4 text-odc-success" />
              ) : (
                <XCircle className="h-4 w-4 text-odc-error" />
              )}
            </div>
          );
        })}

        {/* Stockage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-odc-muted">
              <HardDrive className="h-3 w-3" />
              Stockage
            </span>
            <span className="font-medium">{status.storage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-odc-surface-alt overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                status.storage > 80
                  ? 'bg-odc-error'
                  : status.storage > 60
                    ? 'bg-odc-warning'
                    : 'bg-odc-success',
              )}
              style={{ width: `${status.storage}%` }}
            />
          </div>
        </div>

        {/* Info système */}
        <div className="pt-3 border-t border-odc-border space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-odc-muted">Uptime</span>
            <span className="font-medium">{uptime}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-odc-muted">Version</span>
            <span className="font-medium font-mono">
              v{status.version}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   HELPER
   ============================================================================ */

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `${seconds}s`;
}