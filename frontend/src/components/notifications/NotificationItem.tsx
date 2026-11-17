// src/components/notifications/NotificationItem.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-handler';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface Notification {
  id: string;
  type: NotificationType | string;
  titre: string;
  message: string;
  lien?: string | null;
  lue: boolean;
  createdAt: string;
  icone?: string | null;
}

interface TypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  badge: string;
  ring: string;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  INFO: {
    icon: Info,
    label: 'Information',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-500/15',
    badge:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    ring: 'ring-sky-200/60 dark:ring-sky-500/30',
  },
  SUCCESS: {
    icon: CheckCircle2,
    label: 'Succès',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-500/15',
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    ring: 'ring-emerald-200/60 dark:ring-emerald-500/30',
  },
  WARNING: {
    icon: AlertTriangle,
    label: 'Attention',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/15',
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    ring: 'ring-amber-200/60 dark:ring-amber-500/30',
  },
  ERROR: {
    icon: XCircle,
    label: 'Erreur',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-500/15',
    badge:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    ring: 'ring-rose-200/60 dark:ring-rose-500/30',
  },
};

const FALLBACK_CONFIG: TypeConfig = {
  icon: Bell,
  label: 'Notification',
  color: 'text-slate-600 dark:text-slate-400',
  bg: 'bg-slate-100 dark:bg-slate-500/15',
  badge:
    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300',
  ring: 'ring-slate-200/60 dark:ring-slate-500/30',
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  notification: Notification;
}

export function NotificationItem({ notification }: Props) {
  const qc = useQueryClient();

  // ⭐ Fallback propre : on garde l'icône du TYPE, jamais une Bell générique
  const config =
    TYPE_CONFIG[notification.type as NotificationType] ?? FALLBACK_CONFIG;
  const Icon = config.icon;

  /* ═══════════════════════════════════════════════════════════════════════
     MUTATION — Marquer comme lu (seulement si nécessaire)
     ═══════════════════════════════════════════════════════════════════════ */
  const markReadMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/notifications/${notification.id}/lue`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  /* ═══════════════════════════════════════════════════════════════════════
     MUTATION — Supprimer
     ═══════════════════════════════════════════════════════════════════════ */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/notifications/${notification.id}`);
    },
    onSuccess: () => {
      toast.success('Notification supprimée');
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  /* ═══════════════════════════════════════════════════════════════════════
     HANDLERS
     ═══════════════════════════════════════════════════════════════════════ */
  const handleOpen = () => {
    // ⭐ N'appelle la mutation QUE si vraiment non lue
    if (!notification.lue && !markReadMutation.isPending) {
      markReadMutation.mutate();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!deleteMutation.isPending) {
      deleteMutation.mutate();
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     CONTENU (partagé Link/Button)
     ═══════════════════════════════════════════════════════════════════════ */
  const content = (
    <>
      {/* Icône */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-105',
          config.bg,
          config.ring,
        )}
      >
        <Icon className={cn('h-5 w-5', config.color)} aria-hidden />
      </div>

      {/* Texte */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p
              className={cn(
                'truncate text-sm',
                notification.lue
                  ? 'font-medium text-foreground/80'
                  : 'font-semibold text-foreground',
              )}
            >
              {notification.titre}
            </p>
            {/* Badge type */}
            <Badge
              variant="outline"
              className={cn(
                'hidden shrink-0 border text-[10px] font-medium sm:inline-flex',
                config.badge,
              )}
            >
              {config.label}
            </Badge>
          </div>
          {!notification.lue && (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-label="Non lue"
            />
          )}
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {notification.message}
        </p>

        <p className="mt-1.5 text-xs text-muted-foreground/80">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDU
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <li
      className={cn(
        'group flex items-start gap-3 p-4 transition-colors',
        !notification.lue
          ? 'bg-primary/5 hover:bg-primary/10'
          : 'hover:bg-muted/40',
      )}
    >
      {notification.lien ? (
        <Link
          href={notification.lien}
          onClick={handleOpen}
          className="flex min-w-0 flex-1 items-start gap-3 outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="flex min-w-0 flex-1 items-start gap-3 text-left outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          {content}
        </button>
      )}

      {/* Bouton supprimer — visible au survol / focus */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 shrink-0',
          'text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
        )}
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        aria-label="Supprimer la notification"
      >
        {deleteMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </li>
  );
}