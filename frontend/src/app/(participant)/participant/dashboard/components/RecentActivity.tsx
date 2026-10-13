'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, Award, FileText, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';

const ICONS: Record<string, any> = {
  inscription: FileText,
  attestation: Award,
  presence: QrCode,
  default: Bell,
};

export function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'notifications', 'recent'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { limit: 6 } });
      return data.data;
    },
  });

  if (isLoading) return <Skeleton className="h-80" />;

  const notifications = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activité récente</CardTitle>
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
            {notifications.map((n: any) => {
              const Icon = ICONS[n.metadata?.type] ?? ICONS.default;
              return (
                <li key={n.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-odc-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{n.titre}</p>
                    <p className="text-xs text-odc-muted line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-odc-muted mt-0.5">
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