// src/hooks/useNotifications.ts
'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from './useSocket';
import { getErrorMessage } from '@/lib/error-handler';
import type { Notification } from '@/types/notification.types';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const qc = useQueryClient();
  const { socket } = useSocket();
  const {
    setNotifications,
    addNotification,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    removeNotification,
    unreadCount: storeCount,
  } = useNotificationStore();

  /* -------------------- Query liste -------------------- */
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data.data;
    },
  });

  /* -------------------- Query compteur non-lues -------------------- */
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: queryKeys.notifications.nonLues,
    queryFn: async () => {
      const { data } = await api.get('/notifications/non-lues/count');
      return data.data.count;
    },
    refetchInterval: 60_000,
  });

  /* -------------------- Sync store -------------------- */
  useEffect(() => {
    if (notifications.length) setNotifications(notifications);
  }, [notifications, setNotifications]);

  /* -------------------- Socket temps réel -------------------- */
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

  /* -------------------- Mutations -------------------- */
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/lue`);
      return id;
    },
    onSuccess: (id) => {
      storeMarkAsRead(id);
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.nonLues });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/toutes-lues');
    },
    onSuccess: () => {
      storeMarkAllAsRead();
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.nonLues });
      toast.success('Toutes les notifications marquées comme lues');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const removeMutation = useMutation({
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

  return {
    notifications,
    unreadCount: unreadCount ?? storeCount,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    refetch: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  };
}