// src/app/(participant)/participant/messagerie/components/ConversationList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users, ChevronRight, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { NewConversationDialog } from './NewConversationDialog';
import { api } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  onOpenChat: (id: string) => void;
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

export function ConversationList({ onOpenChat }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, isFetching, refetch } = useQuery<
    Conversation[]
  >({
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

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <Card className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </Card>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <Card className="p-6">
        <QueryErrorState
          onRetry={() => { void refetch(); }}
          isRetrying={isFetching}
        />
      </Card>
    );
  }

  const conversations = data ?? [];

  /* ─── Vide ─── */
  if (!conversations.length) {
    return (
      <Card>
        <div className="p-6">
          <EmptyState
            icon={MessageSquare}
            title="Aucune conversation"
            description="Démarrez une nouvelle conversation avec un membre de la communauté."
            action={<NewConversationDialog onCreated={onOpenChat} />}
          />
        </div>
      </Card>
    );
  }

  /* ─── Rendu ─── */
  return (
    <div className="space-y-4">
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une conversation…"
            className="pl-9"
          />
        </div>
        <NewConversationDialog onCreated={onOpenChat} />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="p-6">
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={`Aucune conversation ne correspond à « ${search} ».`}
            />
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {filtered.map((c) => {
              const other = c.estGroupe
                ? null
                : c.membres?.find((m) => m.id !== currentUserId);

              const title = c.estGroupe
                ? c.titre
                : `${other?.prenom ?? ''} ${other?.nom ?? ''}`.trim();

              const lastMsg = c.messages?.[0]?.contenu ?? 'Aucun message';

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onOpenChat(c.id)}
                    className="group w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    {c.estGroupe ? (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={other?.photoUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-display font-bold">
                          {getInitials(other?.nom ?? '', other?.prenom ?? '')}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate text-foreground">
                          {title || 'Conversation'}
                        </p>
                        {c.dernierMessageAt && (
                          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                            {formatRelativeTime(c.dernierMessageAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p
                          className={cn(
                            'text-xs truncate',
                            c.dernierMessageAt
                              ? 'text-muted-foreground'
                              : 'italic text-muted-foreground/70',
                          )}
                        >
                          {lastMsg}
                        </p>
                        {!c.estGroupe && (
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0 font-medium"
                          >
                            {other?.role?.libelle ?? other?.role?.nom ?? 'Membre'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}