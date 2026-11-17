// src/app/(participant)/participant/messagerie/components/ConversationList.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Users,
  ChevronRight,
  Search,
  X,
  Inbox,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { NewConversationDialog } from './NewConversationDialog';
import { api } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/auth.store';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

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
      const lastMsg = c.messages?.[0]?.contenu ?? '';
      return (
        title.toLowerCase().includes(q) ||
        lastMsg.toLowerCase().includes(q)
      );
    });
  }, [data, search, currentUserId]);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Card className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <Card className="p-6">
        <QueryErrorState
          onRetry={() => {
            void refetch();
          }}
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
            icon={Inbox}
            title="Aucune conversation"
            description="Démarrez une nouvelle conversation avec un membre de la communauté."
            action={<NewConversationDialog onCreated={onOpenChat} />}
          />
        </div>
      </Card>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une conversation…"
            className="pl-9 pr-8"
            aria-label="Rechercher une conversation"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch('')}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>

        <NewConversationDialog onCreated={onOpenChat} />
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <Card>
          <div className="p-6">
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={`Aucune conversation ne correspond à « ${search} ».`}
              action={
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  Effacer la recherche
                </Button>
              }
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

              const title =
                c.estGroupe
                  ? c.titre ?? 'Groupe sans titre'
                  : `${other?.prenom ?? ''} ${other?.nom ?? ''}`.trim() ||
                    'Conversation';

              const lastMsg = c.messages?.[0]?.contenu ?? 'Aucun message';
              const hasMessages = !!c.messages?.[0]?.contenu;

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onOpenChat(c.id)}
                    className={cn(
                      'group w-full flex items-center gap-4 p-4 text-left',
                      'hover:bg-muted/50 transition-colors',
                      'focus:outline-none focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset',
                    )}
                    aria-label={`Ouvrir la conversation ${title}`}
                  >
                    {/* Avatar */}
                    {c.estGroupe ? (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
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

                    {/* Contenu */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-sm text-foreground">
                          {title}
                        </p>
                        {c.dernierMessageAt && (
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {formatRelativeTime(c.dernierMessageAt)}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-xs',
                            hasMessages
                              ? 'text-muted-foreground'
                              : 'italic text-muted-foreground/70',
                          )}
                        >
                          {lastMsg}
                        </p>
                        {!c.estGroupe && (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px] font-medium"
                          >
                            {other?.role?.libelle ??
                              other?.role?.nom ??
                              'Membre'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Compteur */}
      <p className="text-center text-xs text-muted-foreground">
        {filtered.length} conversation{filtered.length > 1 ? 's' : ''}
        {search && ` sur ${conversations.length}`}
      </p>
    </div>
  );
}