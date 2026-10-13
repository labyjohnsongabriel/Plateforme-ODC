'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Bell, CheckCircle2, AlertTriangle, XCircle, Info, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<
  string,
  { icon: any; color: string; bg: string }
> = {
  INFO: {
    icon: Info,
    color: 'text-odc-info',
    bg: 'bg-odc-info-bg',
  },
  SUCCESS: {
    icon: CheckCircle2,
    color: 'text-odc-success',
    bg: 'bg-odc-success-bg',
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'text-odc-warning',
    bg: 'bg-odc-warning-bg',
  },
  ERROR: {
    icon: XCircle,
    color: 'text-odc-error',
    bg: 'bg-odc-error-bg',
  },
};

interface Props {
  notification: any;
}

export function NotificationItem({ notification }: Props) {
  const qc = useQueryClient();
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.INFO;
  const Icon = notification.icon
    ? Bell
    : config.icon;

  const markReadMutation = useMutation({
    mutationFn: async () => {
      if (!notification.lue) {
        await api.put(`/notifications/${notification.id}/lue`);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/notifications/${notification.id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleClick = () => {
    if (!notification.lue) markReadMutation.mutate();
  };

  const content = (
    <div
      className={cn(
        'flex items-start gap-4 p-4 transition-colors',
        !notification.lue
          ? 'bg-odc-primary-soft/20 hover:bg-odc-primary-soft/40'
          : 'hover:bg-odc-surface-alt/50',
      )}
      onClick={handleClick}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p
            className={cn(
              'font-medium text-sm',
              !notification.lue && 'text-odc-text-primary',
            )}
          >
            {notification.titre}
          </p>
          {!notification.lue && (
            <span className="w-2 h-2 rounded-full bg-odc-primary shrink-0 mt-1.5" />
          )}
        </div>

        <p className="text-sm text-odc-muted line-clamp-2">{notification.message}</p>

        <p className="text-xs text-odc-muted mt-1.5">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-odc-muted hover:text-odc-error hover:bg-odc-error-bg shrink-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteMutation.mutate();
        }}
        aria-label="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return notification.lien ? (
    <li>
      <Link href={notification.lien}>{content}</Link>
    </li>
  ) : (
    <li>{content}</li>
  );
}