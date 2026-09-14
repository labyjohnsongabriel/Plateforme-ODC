import { Check, X, Clock } from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { timeAgo } from '@/utils/formatDate';

// ✅ TYPE pur → import type séparé
import type { Connection } from '../types/reseautage.types';

// ============================================================================
//  PROPS
// ============================================================================

interface ConnectionRequestProps {
  connection: Connection;
  onAccept: (connectionId: string) => void;
  onRefuse: (connectionId: string) => void;
  loading?: boolean;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function ConnectionRequest({
  connection,
  onAccept,
  onRefuse,
  loading,
}: ConnectionRequestProps) {
  const user = connection.expediteur;
  if (!user) return null;

  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        <Avatar
          src={user.photoUrl}
          name={`${user.prenom} ${user.nom}`}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark truncate">
                {user.prenom} {user.nom}
              </h3>
              {user.role?.nom && (
                <Badge variant="primary" size="xs" className="mt-1">
                  {user.role.nom}
                </Badge>
              )}
            </div>
            <span className="flex items-center gap-1 text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark flex-shrink-0">
              <Clock size={10} />
              {timeAgo(connection.createdAt)}
            </span>
          </div>

          {connection.message && (
            <div className="mt-2 p-2 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark italic">
              💬 {connection.message}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="success"
              size="sm"
              fullWidth
              icon={<Check size={14} />}
              onClick={() => onAccept(connection.id)}
              loading={loading}
            >
              Accepter
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon={<X size={14} />}
              onClick={() => onRefuse(connection.id)}
              disabled={loading}
            >
              Refuser
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ConnectionRequest;