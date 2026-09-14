import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { NotificationService } from '../services/notification.service';
import { useSocket } from '@/features/messagerie/hooks/useSocket';
import type { Notification } from '../types/notification.types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, count] = await Promise.all([
        NotificationService.list({ limit: 50 }),
        NotificationService.countNonLues(),
      ]);
      setNotifications(listRes.data);
      setUnreadCount(count);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Socket temps réel
  useSocket('notification:new', (notif: Notification) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((c) => c + 1);

    // Toast
    toast.success(notif.titre, { icon: '🔔' });
  });

  const marquerLue = async (id: string) => {
    try {
      await NotificationService.marquerLue(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const marquerToutesLues = async () => {
    try {
      await NotificationService.marquerToutesLues();
      setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications sont lues');
    } catch {
      // silent
    }
  };

  const remove = async (id: string) => {
    try {
      await NotificationService.delete(id);
      const notif = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notif && !notif.lue) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    marquerLue,
    marquerToutesLues,
    remove,
    refetch: load,
  };
}