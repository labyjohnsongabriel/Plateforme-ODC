import { useState } from 'react';
import { Search, Users } from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { MemberCard } from './MemberCard';
import { useDebounce } from '@/hooks/useDebounce';

// ✅ TYPE pur → import type séparé
import type { MemberUser } from '../types/reseautage.types';

// ============================================================================
//  PROPS
// ============================================================================

interface MemberDirectoryProps {
  members?: MemberUser[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onConnect?: (member: MemberUser) => void;
  onMessage?: (member: MemberUser) => void;
  onViewProfile?: (member: MemberUser) => void;
  connectedIds?: string[];
  pendingIds?: string[];
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function MemberDirectory({
  members = [],
  loading = false,
  onSearch,
  onConnect,
  onMessage,
  onViewProfile,
  connectedIds = [],
  pendingIds = [],
}: MemberDirectoryProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  // Callback de recherche
  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch?.(debouncedSearch);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Réseau
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {members.length} membre{members.length > 1 ? 's' : ''} dans la
            communauté ODC
          </p>
        </div>
      </div>

      {/* Recherche */}
      <Card padding="md">
        <Input
          placeholder="Rechercher un membre par nom, compétence, ville..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader text="Chargement des membres..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="Aucun membre trouvé"
          description="Essayez de modifier votre recherche ou revenez plus tard"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isConnected={connectedIds.includes(member.id)}
              onConnect={onConnect}
              onMessage={onMessage}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MemberDirectory;