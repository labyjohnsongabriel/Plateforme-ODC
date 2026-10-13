// src/hooks/queries/useNotifications.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/store/notification.store';
import type {
  Notification,
  NotificationFilters,
  PaginatedResponse,
} from '@/types/notification.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Notification>;
      }>('/notifications', { params: filters });
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.nonLues,
    queryFn: async () => {
      const { data } = await api.get('/notifications/non-lues/count');
      return data.data.count as number;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Notification }>(
        `/notifications/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/* ============================================================================
   SOCKET — Temps réel
   ============================================================================ */

export function useNotificationSocket() {
  const { socket } = useSocket();
  const qc = useQueryClient();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!socket) return;

    const handler = (notif: Notification) => {
      addNotification(notif);
      toast(notif.titre, {
        description: notif.message,
        duration: 5000,
      });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.nonLues });
    };

    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [socket, addNotification, qc]);
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/lue`);
      return id;
    },
    onSuccess: (id) => {
      markAsRead(id);
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.nonLues });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useMarkAllNotificationsAsRead() {
  const qc = useQueryClient();
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationFn: async () => {
      await api.put('/notifications/toutes-lues');
    },
    onSuccess: () => {
      markAllAsRead();
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.nonLues });
      toast.success('Toutes les notifications marquées comme lues');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
      return id;
    },
    onSuccess: (id) => {
      removeNotification(id);
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteAllNotifications() {
  const qc = useQueryClient();
  const clear = useNotificationStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      await api.delete('/notifications');
    },
    onSuccess: () => {
      clear();
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success('Notifications supprimées');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkMarkAsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.put('/notifications/bulk/lues', { ids });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.nonLues });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}