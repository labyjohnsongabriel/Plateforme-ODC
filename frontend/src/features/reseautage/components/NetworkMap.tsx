import { Users, TrendingUp, Handshake, Award } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { StatCard } from '@/components/charts/StatCard';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import type { MesConnectionsResponse } from '../types/reseautage.types';

interface NetworkMapProps {
  connections: MesConnectionsResponse[];
  stats?: {
    totalConnections: number;
    totalDemandes: number;
    totalSuggestions: number;
  };
}

export function NetworkMap({ connections, stats }: NetworkMapProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Mes connexions"
          value={stats?.totalConnections || connections.length}
          icon={<Handshake size={22} />}
          variant="primary"
        />
        <StatCard
          label="Demandes en attente"
          value={stats?.totalDemandes || 0}
          icon={<TrendingUp size={22} />}
          variant="warning"
        />
        <StatCard
          label="Suggestions"
          value={stats?.totalSuggestions || 0}
          icon={<Users size={22} />}
          variant="info"
        />
      </div>

      {/* Réseau */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} className="text-odc-primary" />
          <h3 className="font-heading font-semibold text-lg text-odc-text-light dark:text-odc-text-dark">
            Mon réseau ({connections.length})
          </h3>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-8 text-odc-text-muted-light dark:text-odc-text-muted-dark text-sm">
            Vous n'avez pas encore de connexions
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {connections.map((conn) => (
              <div
                key={conn.connectionId}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 transition-colors cursor-pointer"
              >
                <Avatar
                  src={conn.user.photoUrl}
                  name={`${conn.user.prenom} ${conn.user.nom}`}
                  size="lg"
                  status="online"
                />
                <div className="text-xs font-medium text-odc-text-light dark:text-odc-text-dark mt-2 text-center truncate w-full">
                  {conn.user.prenom}
                </div>
                <Badge variant="primary" size="xs" className="mt-1">
                  {conn.user.role.nom}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}