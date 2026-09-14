import { Bell, CheckCheck, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '@/utils/cn';

type FilterType = 'all' | 'unread' | 'read';

export function NotificationList() {
  const {
    notifications,
    unreadCount,
    loading,
    marquerLue,
    marquerToutesLues,
    remove,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.lue;
    if (filter === 'read') return n.lue;
    return true;
  });

  const filters: Array<{ value: FilterType; label: string; count?: number }> = [
    { value: 'all', label: 'Toutes', count: notifications.length },
    { value: 'unread', label: 'Non lues', count: unreadCount },
    { value: 'read', label: 'Lues', count: notifications.length - unreadCount },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Notifications
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : 'Toutes les notifications sont lues'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCheck size={14} />}
            onClick={marquerToutesLues}
          >
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter size={14} className="text-odc-text-muted-light dark:text-odc-text-muted-dark flex-shrink-0" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              filter === f.value
                ? 'bg-odc-primary text-white shadow-odc-sm'
                : 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-light dark:text-odc-text-dark hover:bg-odc-primary-soft'
            )}
          >
            {f.label}
            {f.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  filter === f.value ? 'bg-white/20' : 'bg-odc-primary text-white'
                )}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} />}
          title={
            filter === 'unread'
              ? 'Aucune notification non lue'
              : filter === 'read'
              ? 'Aucune notification lue'
              : 'Aucune notification'
          }
          description="Vous êtes à jour !"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={marquerLue}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}