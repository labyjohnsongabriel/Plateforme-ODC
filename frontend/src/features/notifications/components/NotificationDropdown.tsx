import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dropdown } from '@/components/common/Dropdown';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '@/utils/cn';

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    marquerLue,
    marquerToutesLues,
    remove,
  } = useNotifications();

  return (
    <Dropdown
      align="right"
      className="w-96 max-w-[calc(100vw-2rem)]"
      trigger={
        <button
          className={cn(
            'relative p-2.5 rounded-xl',
            'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20',
            'text-odc-text-light dark:text-odc-text-dark',
            'transition-colors'
          )}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-odc-error text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-odc-surface-dark">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-odc-error animate-ping opacity-75" />
            </>
          )}
        </button>
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-odc-border-light dark:border-odc-border-dark">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-sm text-odc-text-light dark:text-odc-text-dark">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-odc-primary text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={marquerToutesLues}
            className="flex items-center gap-1 text-xs text-odc-primary hover:underline"
          >
            <CheckCheck size={12} />
            Tout lire
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <Loader size="sm" />
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={40} className="mx-auto text-odc-text-muted-light dark:text-odc-text-muted-dark opacity-40 mb-2" />
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Aucune notification
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notifications.slice(0, 5).map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onRead={marquerLue}
                onDelete={remove}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-odc-border-light dark:border-odc-border-dark">
        <Link to="/notifications" className="block">
          <Button variant="ghost" fullWidth size="sm" icon={<ExternalLink size={14} />}>
            Voir toutes les notifications
          </Button>
        </Link>
      </div>
    </Dropdown>
  );
}