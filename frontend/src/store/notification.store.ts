// src/store/notification.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface AppNotification {
  id: string;
  titre: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  lue: boolean;
  lien?: string;
  createdAt: string;
}

export interface NotificationState {
  /* -------------------- ÉTAT -------------------- */
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  lastFetchedAt: number | null;

  /* -------------------- ACTIONS -------------------- */
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  updateNotification: (id: string, patch: Partial<AppNotification>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (n: number) => void;
  incrementUnread: () => void;
  resetUnread: () => void;

  /* -------------------- UI -------------------- */
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  /* -------------------- HELPERS -------------------- */
  getById: (id: string) => AppNotification | undefined;
  getUnread: () => AppNotification[];

  /* -------------------- RESET -------------------- */
  clear: () => void;
}

/* ============================================================================
   HELPERS INTERNES
   ============================================================================ */

function computeUnreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.lue).length;
}

/* ============================================================================
   STORE
   ============================================================================ */

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      /* -------------------- ÉTAT INITIAL -------------------- */
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      lastFetchedAt: null,

      /* -------------------- ACTIONS -------------------- */

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: computeUnreadCount(notifications),
          lastFetchedAt: Date.now(),
        }),

      addNotification: (notification) =>
        set((state) => {
          // Éviter les doublons
          if (state.notifications.some((n) => n.id === notification.id)) {
            return state;
          }

          const newNotifications = [notification, ...state.notifications].slice(0, 100);

          return {
            notifications: newNotifications,
            unreadCount: notification.lue
              ? state.unreadCount
              : state.unreadCount + 1,
          };
        }),

      updateNotification: (id, patch) =>
        set((state) => {
          const index = state.notifications.findIndex((n) => n.id === id);
          if (index === -1) return state;

          const prev = state.notifications[index];
          const next = { ...prev, ...patch };
          const notifications = [...state.notifications];
          notifications[index] = next;

          return {
            notifications,
            unreadCount:
              prev.lue !== next.lue
                ? computeUnreadCount(notifications)
                : state.unreadCount,
          };
        }),

      removeNotification: (id) =>
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          const notifications = state.notifications.filter((n) => n.id !== id);

          return {
            notifications,
            unreadCount:
              notif && !notif.lue && state.unreadCount > 0
                ? state.unreadCount - 1
                : state.unreadCount,
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          if (!notif || notif.lue) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, lue: true } : n,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, lue: true })),
          unreadCount: 0,
        })),

      setUnreadCount: (n) => set({ unreadCount: n }),

      incrementUnread: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),

      resetUnread: () => set({ unreadCount: 0 }),

      /* -------------------- UI -------------------- */

      openPanel: () => set({ isOpen: true }),
      closePanel: () => set({ isOpen: false }),
      togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

      /* -------------------- HELPERS -------------------- */

      getById: (id) => get().notifications.find((n) => n.id === id),

      getUnread: () => get().notifications.filter((n) => !n.lue),

      /* -------------------- RESET -------------------- */

      clear: () =>
        set({
          notifications: [],
          unreadCount: 0,
          lastFetchedAt: null,
          isOpen: false,
        }),
    }),
    {
      name: 'odc-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 20), // Limiter la persistance
        unreadCount: state.unreadCount,
      }),
      version: 1,
    },
  ),
);

/* ============================================================================
   SÉLECTEURS
   ============================================================================ */

export const selectNotifications = (s: NotificationState) => s.notifications;
export const selectUnreadCount = (s: NotificationState) => s.unreadCount;
export const selectHasUnread = (s: NotificationState) => s.unreadCount > 0;
export const selectPanelOpen = (s: NotificationState) => s.isOpen;