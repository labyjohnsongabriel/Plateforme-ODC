import { Activity, User, FileText, Award, Calendar, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

// ============================================================================
//  TYPES
// ============================================================================

export type ActivityType =
  | 'inscription'
  | 'attestation'
  | 'session'
  | 'user'
  | 'formation';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string | Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface RecentActivityProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
  maxItems?: number;
}

// ============================================================================
//  HELPERS
// ============================================================================

const ICONS: Record<ActivityType, ReactNode> = {
  inscription: <FileText size={14} />,
  attestation: <Award size={14} />,
  session: <Calendar size={14} />,
  user: <User size={14} />,
  formation: <TrendingUp size={14} />,
};

const COLORS: Record<ActivityType, string> = {
  inscription: 'bg-blue-100 text-blue-600',
  attestation: 'bg-green-100 text-green-600',
  session: 'bg-orange-100 text-orange-600',
  user: 'bg-purple-100 text-purple-600',
  formation: 'bg-cyan-100 text-cyan-600',
};

function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH} h`;
  if (diffD < 7) return `Il y a ${diffD} j`;
  return then.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function RecentActivity({
  activities,
  title = 'Activité récente',
  className,
  maxItems = 8,
}: RecentActivityProps) {
  const items = activities.slice(0, maxItems);

  return (
    <div
      className={cn(
        'bg-white dark:bg-odc-surface-dark rounded-xl border border-odc-border-light dark:border-odc-border-dark p-5',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-odc-primary" />
        <h3 className="font-heading font-semibold text-sm text-odc-text-light dark:text-odc-text-dark">
          {title}
        </h3>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-odc-text-muted-light">
          <Activity size={32} className="mb-2 opacity-50" />
          <p className="text-xs">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 pb-3 border-b border-odc-border-light/50 dark:border-odc-border-dark/50 last:border-0 last:pb-0"
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                  COLORS[activity.type]
                )}
              >
                {ICONS[activity.type]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-odc-text-light dark:text-odc-text-dark truncate">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-[11px] text-odc-text-muted-light dark:text-odc-text-muted-dark truncate mt-0.5">
                    {activity.description}
                  </p>
                )}
                <p className="text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;