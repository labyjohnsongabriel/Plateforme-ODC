// src/components/messagerie/ConversationList.tsx
'use client';

import { Search, MessageSquarePlus, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Conversation } from '../types/messagerie.types';
import { Input } from '@/components/common/Input';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { ConversationItem } from './ConversationItem';
import { MessagerieService } from '../services/messagerie.service';
import { useDebounce } from '@/hooks/useDebounce';

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
          .includes(debouncedSearch.toLowerCase()),
      )
    : conversations;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-50">
            Messages
          </h2>
          {onNewClick && (
            <button
              onClick={onNewClick}
              className="rounded-lg p-2 text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
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

      {/* Liste */}
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