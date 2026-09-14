import {
  MapPin,
  UserPlus,
  MessageCircle,
  UserCheck,
  Building,
} from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

// ✅ TYPE pur → import type séparé
import type { MemberUser } from '../types/reseautage.types';

// ============================================================================
//  PROPS
// ============================================================================

interface MemberCardProps {
  member: MemberUser;
  isConnected?: boolean;
  onConnect?: (member: MemberUser) => void;
  onMessage?: (member: MemberUser) => void;
  onViewProfile?: (member: MemberUser) => void;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function MemberCard({
  member,
  isConnected,
  onConnect,
  onMessage,
  onViewProfile,
}: MemberCardProps) {
  return (
    <Card hover className="group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          src={member.photoUrl}
          name={`${member.prenom} ${member.nom}`}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h3
            className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark truncate cursor-pointer hover:text-odc-primary transition-colors"
            onClick={() => onViewProfile?.(member)}
          >
            {member.prenom} {member.nom}
          </h3>
          {member.role?.nom && (
            <Badge variant="primary" size="xs" className="mt-1">
              {member.role.nom}
            </Badge>
          )}
          {member.ville && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              <MapPin size={11} />
              {member.ville}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark line-clamp-2 mb-3">
          {member.bio}
        </p>
      )}

      {/* Entreprise */}
      {(member.entreprise || member.poste) && (
        <div className="flex items-center gap-1.5 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-3">
          <Building size={12} className="flex-shrink-0" />
          <span className="truncate">
            {member.poste && `${member.poste} • `}
            {member.entreprise}
          </span>
        </div>
      )}

      {/* Compétences */}
      {member.competences && member.competences.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {member.competences.slice(0, 3).map((skill, i) => (
            <Badge key={i} variant="info" size="xs">
              {skill}
            </Badge>
          ))}
          {member.competences.length > 3 && (
            <Badge variant="neutral" size="xs">
              +{member.competences.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-3 border-t border-odc-border-light dark:border-odc-border-dark flex gap-2">
        {isConnected ? (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            icon={<UserCheck size={14} />}
            disabled
          >
            Connecté
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            icon={<UserPlus size={14} />}
            onClick={() => onConnect?.(member)}
          >
            Se connecter
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          icon={<MessageCircle size={14} />}
          onClick={() => onMessage?.(member)}
        />
      </div>
    </Card>
  );
}

export default MemberCard;