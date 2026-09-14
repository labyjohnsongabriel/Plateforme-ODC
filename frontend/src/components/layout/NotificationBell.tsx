import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useAuth';
import {
  fetchNotifications,
  markAllAsRead,
} from '@/store/slices/notificationSlice';
import { cn } from '@/utils/cn';

// ============================================================================
//  NOTIFICATION BELL
// ============================================================================

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { notifications, unreadCount, loading } = useAppSelector(
    (s) => s.notifications
  );

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  // Charger les notifications
  useEffect(() => {
    if (!isAuthenticated) {
      hasFetched.current = false;
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;

    void dispatch(fetchNotifications());

    const interval = setInterval(() => {
      void dispatch(fetchNotifications());
    }, 60_000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch]);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const handleMarkAllAsRead = () => {
    void dispatch(markAllAsRead());
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-xl transition-colors',
          'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20',
          open && 'bg-odc-primary-soft dark:bg-odc-primary-soft/20'
        )}
        aria-label="Notifications"
      >
        <Bell size={20} className="text-odc-text-light dark:text-odc-text-dark" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-odc-error rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-odc-surface-dark rounded-xl shadow-odc-lg border border-odc-border-light dark:border-odc-border-dark overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-odc-border-light dark:border-odc-border-dark">
            <h3 className="font-heading font-semibold text-sm text-odc-text-light dark:text-odc-text-dark">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-odc-primary hover:underline font-medium"
              >
                <CheckCheck size={12} />
                Tout marquer
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="p-6 text-sm text-center text-odc-text-muted-light">
                Chargement…
              </p>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell size={32} className="mx-auto text-odc-text-muted-light mb-2 opacity-50" />
                <p className="text-sm text-odc-text-muted-light">
                  Aucune notification
                </p>
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <Link
                  key={n.id}
                  to={n.lien ?? '#'}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block p-3 border-b border-odc-border-light/50 dark:border-odc-border-dark/50 last:border-0 transition-colors',
                    !n.lue && 'bg-odc-primary-soft/30 dark:bg-odc-primary-soft/10',
                    'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.lue && (
                      <span className="w-2 h-2 rounded-full bg-odc-primary mt-1.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark truncate">
                        {n.titre}
                      </p>
                      <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-odc-border-light dark:border-odc-border-dark">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-odc-primary hover:underline font-medium py-2"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;