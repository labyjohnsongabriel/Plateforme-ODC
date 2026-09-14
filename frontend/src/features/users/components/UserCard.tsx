import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
} from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';

// ✅ TYPE pur → import type séparé
import type { User } from '../types/user.types';

// ============================================================================
//  PROPS
// ============================================================================

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Card hover={!!onClick} onClick={onClick} className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar
          src={user.photoUrl}
          name={`${user.prenom} ${user.nom}`}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark truncate">
            {user.prenom} {user.nom}
          </h3>
          {user.role?.nom && (
            <Badge variant="primary" size="xs" className="mt-1">
              {user.role.nom}
            </Badge>
          )}
          {user.actif === false && (
            <Badge variant="error" size="xs" className="mt-1 ml-1">
              Inactif
            </Badge>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="space-y-1.5 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-3">
        {user.email && (
          <div className="flex items-center gap-1.5">
            <Mail size={12} />
            <span className="truncate">{user.email}</span>
          </div>
        )}
        {user.telephone && (
          <div className="flex items-center gap-1.5">
            <Phone size={12} />
            {user.telephone}
          </div>
        )}
        {user.ville && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            {user.ville}
          </div>
        )}
        {user.entreprise && (
          <div className="flex items-center gap-1.5">
            <Building2 size={12} />
            {user.entreprise}
          </div>
        )}
        {user.poste && (
          <div className="flex items-center gap-1.5">
            <Briefcase size={12} />
            {user.poste}
          </div>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark line-clamp-2">
          {user.bio}
        </p>
      )}
    </Card>
  );
}

export default UserCard;