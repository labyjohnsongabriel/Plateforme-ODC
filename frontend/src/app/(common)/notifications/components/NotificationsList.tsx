'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { NotificationItem } from './NotificationItem';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function NotificationsList() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', tab, filters],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: filters });
      return data;
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/toutes-lues');
    },
    onSuccess: () => {
      toast.success('Toutes les notifications marquées comme lues');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <Card className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </Card>
    );
  }

  const notifications = data?.data ?? [];
  const displayed = tab === 'unread'
    ? notifications.filter((n: any) => !n.lue)
    : notifications;
  const unreadCount = notifications.filter((n: any) => !n.lue).length;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-odc-border">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            {markAllMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={tab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          description="Vous êtes à jour !"
        />
      ) : (
        <ul className="divide-y divide-odc-border">
          {displayed.map((n: any) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ul>
      )}

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