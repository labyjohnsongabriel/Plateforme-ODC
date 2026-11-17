// src/components/notifications/NotificationsList.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bell,
  CheckCheck,
  Loader2,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { NotificationItem } from './NotificationItem';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type TabValue = 'all' | 'unread';
type TypeFilter = 'all' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface NotificationsResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function NotificationsList() {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket } = useSocket();

  /* ═══════════════════════════════════════════════════════════════════════
     ÉTAT — synchronisé avec l'URL
     ═══════════════════════════════════════════════════════════════════════ */
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const tab: TabValue =
    searchParams.get('tab') === 'unread' ? 'unread' : 'all';
  const typeFilter = (searchParams.get('type') as TypeFilter) || 'all';

  const [markingAll, setMarkingAll] = useState(false);

  /* ═══════════════════════════════════════════════════════════════════════
     HELPERS — mise à jour URL
     ═══════════════════════════════════════════════════════════════════════ */
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset page sur changement de filtre
    if (!('page' in updates)) params.delete('page');
    const query = params.toString();
    router.push(query ? `?${query}` : '', { scroll: false });
  };

  /* ═══════════════════════════════════════════════════════════════════════
     QUERY — notifications paginées
     ═══════════════════════════════════════════════════════════════════════ */
  const { data, isLoading, isError, isFetching, refetch } =
    useQuery<NotificationsResponse>({
      queryKey: ['notifications', { tab, typeFilter, page }],
      queryFn: async () => {
        const { data } = await api.get('/notifications', {
          params: {
            page,
            limit: 20,
            ...(tab === 'unread' ? { lue: false } : {}),
            ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
          },
        });
        return {
          data: data?.data ?? [],
          pagination: data?.pagination ?? {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        };
      },
      placeholderData: (prev) => prev, // ⭐ pas de flash de loading
    });

  /* ═══════════════════════════════════════════════════════════════════════
     QUERY — compteur non lues
     ═══════════════════════════════════════════════════════════════════════ */
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/non-lues/count');
      return Number(data?.data?.count ?? 0);
    },
    refetchInterval: 60_000,
  });

  /* ═══════════════════════════════════════════════════════════════════════
     SOCKET — temps réel
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!socket) return;

    const onNewNotification = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    };
    const onUnreadCount = ({ count }: { count: number }) => {
      qc.setQueryData(['notifications', 'unread-count'], count);
    };

    socket.on('notification:new', onNewNotification);
    socket.on('notifications:count', onUnreadCount);

    return () => {
      socket.off('notification:new', onNewNotification);
      socket.off('notifications:count', onUnreadCount);
    };
  }, [socket, qc]);

  /* ═══════════════════════════════════════════════════════════════════════
     MUTATION — tout marquer comme lu
     ═══════════════════════════════════════════════════════════════════════ */
  const markAllMutation = useMutation({
    mutationFn: async () => {
      setMarkingAll(true);
      await api.put('/notifications/toutes-lues');
    },
    onSuccess: () => {
      toast.success('Toutes les notifications ont été marquées comme lues');
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.setQueryData(['notifications', 'unread-count'], 0);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    onSettled: () => setMarkingAll(false),
  });

  /* ═══════════════════════════════════════════════════════════════════════
     TOTAL
     ═══════════════════════════════════════════════════════════════════════ */
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 0;
  const notifications = data?.data ?? [];

  const typeIcon = useMemo(
    () => ({
      INFO: Info,
      SUCCESS: CheckCircle2,
      WARNING: AlertTriangle,
      ERROR: XCircle,
    }),
    [],
  );

  /* ═══════════════════════════════════════════════════════════════════════
     LOADING
     ═══════════════════════════════════════════════════════════════════════ */
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     ERREUR
     ═══════════════════════════════════════════════════════════════════════ */
  if (isError) {
    return (
      <Card className="p-6">
        <QueryErrorState
          onRetry={() => {
            void refetch();
          }}
          isRetrying={isFetching}
        />
      </Card>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RENDU
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Card className="overflow-hidden">
      {/* ═══ FILTRES ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <Tabs
          value={tab}
          onValueChange={(v) => updateParams({ tab: v as TabValue })}
        >
          <TabsList>
            <TabsTrigger value="all">
              Toutes
              {tab === 'all' && total > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({total})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    'bg-primary text-primary-foreground',
                  )}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* Filtre par type */}
          <Select
            value={typeFilter}
            onValueChange={(v) =>
              updateParams({ type: v === 'all' ? null : v })
            }
          >
            <SelectTrigger className="h-9 w-[150px]">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="INFO">Information</SelectItem>
              <SelectItem value="SUCCESS">Succès</SelectItem>
              <SelectItem value="WARNING">Attention</SelectItem>
              <SelectItem value="ERROR">Erreur</SelectItem>
            </SelectContent>
          </Select>

          {/* Tout marquer comme lu */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markingAll || markAllMutation.isPending}
            >
              {markAllMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">Tout marquer lu</span>
              <span className="sm:hidden">Tout</span>
            </Button>
          )}
        </div>
      </div>

      {/* ═══ LISTE / EMPTY ═══ */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            tab === 'unread'
              ? 'Aucune notification non lue'
              : typeFilter !== 'all'
                ? 'Aucune notification de ce type'
                : 'Aucune notification'
          }
          description={
            tab === 'unread'
              ? 'Vous êtes à jour ! 🎉'
              : typeFilter !== 'all'
                ? 'Essayez de retirer le filtre par type.'
                : 'Vous serez notifié dès qu’il y aura du nouveau.'
          }
          action={
            typeFilter !== 'all' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ type: null })}
              >
                Réinitialiser le filtre
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="divide-y divide-border">
          {notifications.map((n: any) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ul>
      )}

      {/* ═══ PAGINATION ═══ */}
      {totalPages > 1 && (
        <div className="border-t p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) =>
              updateParams({ page: String(newPage) })
            }
          />
        </div>
      )}
    </Card>
  );
}