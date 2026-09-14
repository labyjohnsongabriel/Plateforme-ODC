import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, timeAgo } from '@/utils/formatDate';
import type { SessionSummary } from '../types/dashboard.types';

interface UpcomingSessionsProps {
  sessions: SessionSummary[];
  title?: string;
  maxItems?: number;
}

export function UpcomingSessions({
  sessions = [],
  title = 'Prochaines sessions',
  maxItems = 5,
}: UpcomingSessionsProps) {
  const displayed = sessions.slice(0, maxItems);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-odc-primary" />
          <h3 className="font-heading font-semibold text-lg text-odc-text-light dark:text-odc-text-dark">
            {title}
          </h3>
        </div>
        <Badge variant="primary" size="sm">
          {sessions.length}
        </Badge>
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={<Calendar size={32} />}
          title="Aucune session à venir"
          description="Vos prochaines sessions apparaîtront ici"
        />
      ) : (
        <div className="space-y-2">
          {displayed.map((session) => (
            <Link
              key={session.id}
              to={`/sessions/${session.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/10 transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white flex-shrink-0">
                <Calendar size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark truncate">
                  {session.formation?.titre || session.titre || 'Formation'}
                </div>
                <div className="flex items-center gap-3 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatDate(session.dateDebut)}
                  </span>
                  {session.lieu && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={11} />
                      {session.lieu}
                    </span>
                  )}
                </div>
              </div>

              <ArrowRight
                size={16}
                className="text-odc-primary group-hover:translate-x-1 transition-transform flex-shrink-0"
              />
            </Link>
          ))}
        </div>
      )}

      {sessions.length > maxItems && (
        <div className="mt-4 pt-3 border-t border-odc-border-light dark:border-odc-border-dark text-center">
          <Link to="/sessions">
            <Button variant="ghost" size="sm">
              Voir toutes les sessions ({sessions.length})
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}