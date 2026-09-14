import { Info, CheckCircle, AlertTriangle, XCircle, X, Clock } from 'lucide-react';
import { Notification, TypeNotification } from '../types/notification.types';
import { timeAgo } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

const typeConfig: Record<TypeNotification, { icon: any; color: string; bg: string }> = {
  INFO: { icon: Info, color: 'text-odc-info', bg: 'bg-odc-info-bg' },
  SUCCESS: { icon: CheckCircle, color: 'text-odc-success', bg: 'bg-odc-success-bg' },
  WARNING: { icon: AlertTriangle, color: 'text-odc-warning', bg: 'bg-odc-warning-bg' },
  ERROR: { icon: XCircle, color: 'text-odc-error', bg: 'bg-odc-error-bg' },
};

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onRead,
  onDelete,
  compact,
}: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.INFO;
  const Icon = config.icon;

  return (
    <div
      onClick={() => !notification.lue && onRead?.(notification.id)}
      className={cn(
        'group flex items-start gap-3 rounded-xl transition-all cursor-pointer',
        compact ? 'p-3' : 'p-4',
        'border',
        !notification.lue
          ? 'bg-odc-primary-soft/30 dark:bg-odc-primary-soft/5 border-odc-primary/30'
          : 'bg-white dark:bg-odc-surface-dark border-odc-border-light dark:border-odc-border-dark hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 rounded-xl flex items-center justify-center',
          config.bg,
          config.color,
          compact ? 'w-9 h-9' : 'w-10 h-10'
        )}
      >
        <Icon size={compact ? 16 : 20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm',
              notification.lue
                ? 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
                : 'font-semibold text-odc-text-light dark:text-odc-text-dark'
            )}
          >
            {notification.titre}
          </h4>
          {!notification.lue && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-odc-primary mt-1.5" />
          )}
        </div>

        <p
          className={cn(
            'text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1',
            compact ? 'line-clamp-2' : ''
          )}
        >
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(notification.createdAt)}
          </span>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-odc-error-bg text-odc-error transition-all"
              title="Supprimer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}