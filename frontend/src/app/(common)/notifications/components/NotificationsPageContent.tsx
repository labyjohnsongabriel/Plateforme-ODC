// src/app/(common)/notifications/NotificationsPageContent.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  ArrowLeft,
  Settings,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function NotificationsPageContent() {
  const router = useRouter();

  // ⭐ Compteur global pour l'en-tête
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/non-lues/count');
      return Number(data?.data?.count ?? 0);
    },
    refetchInterval: 60_000,
  });

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* ═══ EN-TÊTE ═══ */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Bell className="h-6 w-6 text-primary" aria-hidden />
            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background"
                aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Vous êtes à jour, aucune nouvelle notification'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Paramètres">
            <Link href="/parametres">
              <Settings className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </header>

      {/* ═══ LISTE ═══ */}
      <NotificationsList />

      {/* ═══ FOOTER INFO ═══ */}
      {unreadCount === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          <CheckCheck className="mr-1 inline h-3 w-3" aria-hidden />
          Toutes vos notifications ont été lues
        </p>
      )}
    </div>
  );
}