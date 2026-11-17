// src/components/messagerie/ConversationList.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { NewConversationDialog } from './NewConversationDialog';
import { api } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  activeId?: string | null;
  onSelect: (id: string) => void;
}

interface Conversation {
  id: string;
  estGroupe: boolean;
  titre?: string | null;
  dernierMessageAt?: string | null;
  messages?: Array<{ contenu: string }>;
  membres?: Array<{
    id: string;
    nom?: string | null;
    prenom?: string | null;
    photoUrl?: string | null;
    role?: { nom?: string; libelle?: string } | null;
  }>;
}

export function ConversationList({ activeId, onSelect }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery<Conversation[]>({
    queryKey: ['messagerie', 'conversations'],
    queryFn: async () => {
      const { data } = await api.get('/messagerie/conversations');
      return data.data ?? [];
    },
    refetchInterval: 15000,
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const other = c.estGroupe
        ? null
        : c.membres?.find((m) => m.id !== currentUserId);
      const title = c.estGroupe
        ? c.titre ?? ''
        : `${other?.prenom ?? ''} ${other?.nom ?? ''}`.trim();
      return title.toLowerCase().includes(q);
    });
  }, [data, search, currentUserId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 border-b bg-background p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-9 pl-9"
            aria-label="Rechercher une conversation"
          />
        </div>
        <NewConversationDialog onCreated={onSelect} />
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Impossible de charger les conversations.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={search ? Search : Inbox}
              title={search ? 'Aucun résultat' : 'Aucune conversation'}
              description={
                search
                  ? `Aucune conversation ne correspond à « ${search} ».`
                  : 'Démarrez une nouvelle conversation pour commencer.'
              }
            />
          </div>
        ) : (
          <ul>
            {filtered.map((c) => {
              const other = c.estGroupe
                ? null
                : c.membres?.find((m) => m.id !== currentUserId);

              const title = c.estGroupe
                ? c.titre ?? 'Groupe sans titre'
                : `${other?.prenom ?? ''} ${other?.nom ?? ''}`.trim() ||
                  'Conversation';

              const lastMsg = c.messages?.[0]?.contenu ?? 'Aucun message';
              const isActive = activeId === c.id;

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      'hover:bg-muted/60',
                      'focus:outline-none focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset',
                      isActive && 'bg-primary/10 hover:bg-primary/15',
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {c.estGroupe ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={other?.photoUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {getInitials(other?.nom ?? '', other?.prenom ?? '')}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-sm',
                            isActive
                              ? 'font-semibold text-primary'
                              : 'font-medium text-foreground',
                          )}
                        >
                          {title}
                        </p>
                        {c.dernierMessageAt && (
                          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                            {formatRelativeTime(c.dernierMessageAt)}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'mt-0.5 truncate text-xs',
                          c.messages?.[0]?.contenu
                            ? 'text-muted-foreground'
                            : 'italic text-muted-foreground/70',
                        )}
                      >
                        {lastMsg}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}