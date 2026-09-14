import { Search, MessageSquarePlus, Users, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Conversation } from '../types/messagerie.types';
import { Input } from '@/components/common/Input';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { ConversationItem } from './ConversationItem';
import { MessagerieService } from '../services/messagerie.service';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

interface ConversationListProps {
  conversations: Conversation[];
  loading?: boolean;
  selectedId?: string;
  currentUserId: string;
  onSelect: (id: string) => void;
  onNewClick?: () => void;
}

export function ConversationList({
  conversations,
  loading,
  selectedId,
  currentUserId,
  onSelect,
  onNewClick,
}: ConversationListProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = debouncedSearch
    ? conversations.filter((c) =>
        MessagerieService.getDisplayName(c, currentUserId)
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      )
    : conversations;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-odc-surface-dark">
      {/* Header */}
      <div className="p-4 border-b border-odc-border-light dark:border-odc-border-dark">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
            Messages
          </h2>
          {onNewClick && (
            <button
              onClick={onNewClick}
              className="p-2 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 text-odc-primary transition-colors"
              title="Nouvelle conversation"
            >
              <MessageSquarePlus size={18} />
            </button>
          )}
        </div>

        <Input
          placeholder="Rechercher..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <Loader text="Chargement..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={40} />}
            title={search ? 'Aucun résultat' : 'Aucune conversation'}
            description={
              search
                ? 'Essayez un autre terme de recherche'
                : 'Commencez une nouvelle conversation'
            }
          />
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              currentUserId={currentUserId}
              isSelected={selectedId === conv.id}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}