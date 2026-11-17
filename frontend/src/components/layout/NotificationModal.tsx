// src/components/layout/NotificationModal.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, CheckCheck, Circle, ExternalLink, Loader2, Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import type { Notification } from '@/types/notification.types';
import type { PaginatedResponse } from '@/types/common.types';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const PREVIEW_KEY = [...queryKeys.notifications.all, 'preview'];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function NotificationModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const unreadQuery = useQuery({
    queryKey: queryKeys.notifications.nonLues,
    queryFn: async () => {
      const { data } = await api.get<{ data: { count: number } }>(
        '/notifications/non-lues/count',
      );
      const count = Number(data.data.count);
      if (!Number.isSafeInteger(count) || count < 0) {
        throw new Error('Le serveur a renvoyé un nombre de notifications invalide.');
      }
      return count;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const notificationsQuery = useQuery({
    queryKey: PREVIEW_KEY,
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Notification>>(
        '/notifications',
        { params: { page: 1, limit: 8 } },
      );
      return data.data;
    },
    enabled: open,
    staleTime: 15_000,
  });

  const refreshNotifications = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.nonLues });
  };

  const markOneRead = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/lue`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(PREVIEW_KEY, (current) =>
        current?.map((n) => (n.id === id ? { ...n, lue: true } : n)),
      );
      refreshNotifications();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/toutes-lues');
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(PREVIEW_KEY, (current) =>
        current?.map((n) => ({ ...n, lue: true })),
      );
      queryClient.setQueryData(queryKeys.notifications.nonLues, 0);
      refreshNotifications();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const unreadCount = unreadQuery.data ?? null;
  const notifications = notificationsQuery.data ?? [];
  const unreadCountLabel = unreadQuery.isError
    ? '—'
    : unreadCount !== null && unreadCount > 99
      ? '99+'
      : (unreadCount ?? 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={
            unreadQuery.isError
              ? 'Notifications, compteur indisponible'
              : unreadCount && unreadCount > 0
                ? `Notifications, ${unreadCount} non lues`
                : 'Notifications'
          }
        >
          <Bell className="h-4 w-4" />
          {unreadCount !== null && unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-950"
              aria-hidden
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[min(85vh,720px)] max-w-xl flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b border-slate-200 px-6 py-5 pr-12 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle>Notifications</DialogTitle>
                {unreadCount !== null && unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {unreadCountLabel} non lue{unreadCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <DialogDescription className="mt-1">
                {unreadQuery.isError
                  ? `Compteur indisponible : ${getErrorMessage(unreadQuery.error)}`
                  : 'Les dernières informations de votre espace.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {notificationsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des notifications…
            </div>
          ) : notificationsQuery.isError ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Impossible de charger les notifications.
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {getErrorMessage(notificationsQuery.error)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => void notificationsQuery.refetch()}
              >
                Réessayer
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Inbox className="h-7 w-7 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Tout est à jour
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Vous n&apos;avez aucune notification pour le moment.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((notification) => {
                const href =
                  notification.lien?.startsWith('/') &&
                  !notification.lien.startsWith('//')
                    ? notification.lien
                    : '/notifications';

                return (
                  <li key={notification.id}>
                    <DialogClose asChild>
                      <Link
                        href={href}
                        onClick={() => {
                          if (!notification.lue) markOneRead.mutate(notification.id);
                        }}
                        className={cn(
                          'group flex items-start gap-3 rounded-xl border p-3.5 transition-colors',
                          notification.lue
                            ? 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-900'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            notification.lue
                              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                              : 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900',
                          )}
                          aria-hidden
                        >
                          {notification.lue ? (
                            <Bell className="h-4 w-4" />
                          ) : (
                            <Circle className="h-2.5 w-2.5 fill-current" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {notification.titre}
                            </span>
                            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {notification.message}
                          </span>
                          <span className="mt-2 block text-[11px] text-slate-400 dark:text-slate-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </span>
                      </Link>
                    </DialogClose>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:justify-between">
          {unreadCount !== null && unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {markAllRead.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Tout marquer comme lu
            </Button>
          ) : unreadCount === null ? (
            <span className="text-xs text-red-600 dark:text-red-400">
              Compteur indisponible
            </span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Aucune action en attente
            </span>
          )}
          <DialogClose asChild>
            <Button variant="outline" size="sm">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}