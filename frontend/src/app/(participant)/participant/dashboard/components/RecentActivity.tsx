// src/app/(participant)/participant/dashboard/components/RecentActivity.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, Award, FileText, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';

interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  createdAt: string;
  metadata?: { type?: string } | null;
}

const ICONS: Record<string, typeof Bell> = {
  inscription: FileText,
  attestation: Award,
  presence: QrCode,
  default: Bell,
};

export function RecentActivity() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<NotificationItem[]>({
    queryKey: ['participant', 'notifications', 'recent'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { limit: 6 } });
      return Array.isArray(data?.data) ? data.data : [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
    );
  }

  const notifications = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune activité"
            description="Vos notifications apparaîtront ici."
          />
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => {
              const type = n.metadata?.type;
              const Icon = type ? ICONS[type] ?? ICONS.default : ICONS.default;
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {n.titre}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}