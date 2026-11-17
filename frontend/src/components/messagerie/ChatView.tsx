// src/components/messagerie/ChatView.tsx
'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Send,
  Users,
  Loader2,
  Paperclip,
  Search,
  ChevronLeft,
  MessageSquare,
  X,
  Circle,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { api } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  conversationId: string;
  onBack?: () => void;
}

interface Conversation {
  id: string;
  estGroupe: boolean;
  titre?: string | null;
  membres?: Array<{
    id: string;
    nom?: string | null;
    prenom?: string | null;
    photoUrl?: string | null;
    role?: { nom?: string; libelle?: string } | null;
  }>;
}

interface Message {
  id: string;
  contenu: string;
  expediteurId: string;
  conversationId: string;
  createdAt: string;
  lu?: boolean;
  expediteur?: {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    photoUrl?: string | null;
  } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function ChatView({ conversationId, onBack }: Props) {
  const qc = useQueryClient();
  const { socket } = useSocket();
  const currentUser = useAuthStore((s) => s.user);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ═══════════════════════════════════════════════════════════════════════
     QUERY — messages
     ═══════════════════════════════════════════════════════════════════════ */
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<{
    conversation: Conversation;
    messages: Message[];
  }>({
    queryKey: ['messagerie', 'conversation', conversationId],
    queryFn: async () => {
      const { data } = await api.get(
        `/messagerie/conversations/${conversationId}/messages`,
      );
      return data.data;
    },
    enabled: !!conversationId,
    refetchInterval: socket ? false : 5000,
    // ⭐ Ne pas retry sur 401/403/404
    retry: (failureCount, err: any) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });

  // ⭐ Détection d'un accès refusé
  const accessDenied =
    (error as any)?.response?.status === 403 ||
    (error as any)?.response?.status === 404;

  /* ═══════════════════════════════════════════════════════════════════════
     MUTATION — envoyer
     ═══════════════════════════════════════════════════════════════════════ */
  const sendMutation = useMutation({
    mutationFn: async (contenu: string) => {
      await api.post(
        `/messagerie/conversations/${conversationId}/messages`,
        { contenu },
      );
    },
    onSuccess: () => {
      setMessage('');
      inputRef.current?.focus();
      qc.invalidateQueries({
        queryKey: ['messagerie', 'conversation', conversationId],
      });
      qc.invalidateQueries({ queryKey: ['messagerie', 'conversations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ═══════════════════════════════════════════════════════════════════════
     SOCKET — temps réel
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!socket || accessDenied) return;

    socket.emit('conversation:join', conversationId);

    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        qc.invalidateQueries({
          queryKey: ['messagerie', 'conversation', conversationId],
        });
      }
    };
    const handleTyping = (payload: {
      conversationId: string;
      userId: string;
    }) => {
      if (
        payload.conversationId === conversationId &&
        payload.userId !== currentUser?.id
      ) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTyping);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTyping);
      socket.emit('conversation:leave', conversationId);
    };
  }, [socket, conversationId, qc, currentUser?.id, accessDenied]);

  /* ═══════════════════════════════════════════════════════════════════════
     MARQUER COMME LU (skip si accès refusé)
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!conversationId || accessDenied) return;
    void api
      .put(`/messagerie/conversations/${conversationId}/lu`)
      .then(() =>
        qc.invalidateQueries({ queryKey: ['messagerie', 'conversations'] }),
      )
      .catch(() => {
        /* silencieux — un 403 ici est attendu si non-membre */
      });
  }, [conversationId, qc, accessDenied]);

  /* ═══════════════════════════════════════════════════════════════════════
     AUTO-SCROLL + FOCUS
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  useEffect(() => {
    if (accessDenied) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [conversationId, accessDenied]);

  /* ═══════════════════════════════════════════════════════════════════════
     ENVOI
     ═══════════════════════════════════════════════════════════════════════ */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (accessDenied) return;
      const trimmed = message.trim();
      if (!trimmed || sendMutation.isPending) return;
      sendMutation.mutate(trimmed);
    },
    [message, sendMutation, accessDenied],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     DONNÉES DÉRIVÉES
     ═══════════════════════════════════════════════════════════════════════ */
  const conversation = data?.conversation;
  const messages = data?.messages ?? [];

  const other = conversation?.estGroupe
    ? null
    : conversation?.membres?.find((m) => m.id !== currentUser?.id);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => m.contenu.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  const displayTitle = conversation?.estGroupe
    ? conversation.titre ?? 'Groupe'
    : `${other?.prenom ?? ''} ${other?.nom ?? ''}`.trim() || 'Conversation';

  const displaySubtitle = conversation?.estGroupe
    ? `${conversation.membres?.length ?? 0} membre${
        (conversation.membres?.length ?? 0) > 1 ? 's' : ''
      }`
    : other?.role?.libelle ?? other?.role?.nom ?? 'Membre';

  /* ═══════════════════════════════════════════════════════════════════════
     ⭐ ÉCRAN "ACCÈS REFUSÉ"
     ═══════════════════════════════════════════════════════════════════════ */
  if (accessDenied) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
          <ShieldAlert className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="font-display font-semibold text-foreground">
          Conversation inaccessible
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Vous n'avez pas accès à cette conversation. Elle a peut-être été
          supprimée ou ne vous appartient pas.
        </p>
        {onBack && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onBack}
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Retour aux conversations
          </Button>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RENDU NORMAL
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 border-b bg-background">
        <div className="flex items-center gap-2 px-3 py-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 shrink-0 lg:hidden"
              aria-label="Retour à la liste"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {conversation?.estGroupe ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
              <Users className="h-4 w-4 text-primary" />
            </div>
          ) : (
            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/10">
              <AvatarImage src={other?.photoUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {getInitials(other?.nom ?? '', other?.prenom ?? '')}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayTitle}
            </p>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              {isTyping ? (
                <>
                  <Circle className="h-1.5 w-1.5 animate-pulse fill-emerald-500 text-emerald-500" />
                  En train d'écrire…
                </>
              ) : (
                displaySubtitle
              )}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchOpen((s) => !s);
              if (searchOpen) setSearchQuery('');
            }}
            className={cn('h-8 w-8 shrink-0', searchOpen && 'bg-muted')}
            aria-label="Rechercher dans la conversation"
            aria-pressed={searchOpen}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchOpen && (
          <div className="animate-in fade-in slide-in-from-top-1 border-t px-3 py-2 duration-200">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un message…"
                className="h-8 pl-9 pr-20 text-sm"
                autoFocus
              />
              {searchQuery && (
                <>
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    {filteredMessages.length} résultat
                    {filteredMessages.length > 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Effacer la recherche"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MESSAGES ═══ */}
      <div className="scrollbar-thin flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-background px-3 py-3">
        {isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">
              Impossible de charger les messages.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}
              Réessayer
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-end gap-2',
                  i % 2 === 0 ? 'justify-start' : 'justify-end',
                )}
              >
                {i % 2 === 0 && (
                  <Skeleton className="h-7 w-7 rounded-full" />
                )}
                <Skeleton
                  className={cn(
                    'h-10 rounded-2xl',
                    i % 2 === 0 ? 'w-40' : 'w-32',
                  )}
                />
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              {searchQuery ? (
                <Search className="h-6 w-6 text-primary" />
              ) : (
                <MessageSquare className="h-6 w-6 text-primary" />
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {searchQuery
                ? 'Aucun message trouvé'
                : 'Démarrez la conversation'}
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              {searchQuery
                ? `Aucun message ne correspond à « ${searchQuery} »`
                : 'Envoyez votre premier message 👋'}
            </p>
          </div>
        ) : (
          <>
            {filteredMessages.map((msg, idx) => {
              const prevMsg = filteredMessages[idx - 1];
              const sameAuthor =
                prevMsg &&
                prevMsg.expediteurId === msg.expediteurId &&
                new Date(msg.createdAt).getTime() -
                  new Date(prevMsg.createdAt).getTime() <
                  5 * 60 * 1000;

              // ⭐ Séparateur si nouveau jour
              const currentDay = new Date(msg.createdAt).toDateString();
              const prevDay = prevMsg
                ? new Date(prevMsg.createdAt).toDateString()
                : null;
              const showDateSeparator = !prevMsg || currentDay !== prevDay;

              const isMine = msg.expediteurId === currentUser?.id;

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <DateSeparator date={msg.createdAt} />
                  )}
                  <MessageBubble
                    message={msg}
                    isMine={isMine}
                    showAvatar={conversation?.estGroupe ?? false}
                    compact={!!sameAuthor && !showDateSeparator}
                    status={isMine ? (msg.lu ? 'read' : 'sent') : undefined}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </>
        )}
      </div>

      {/* ═══ INPUT ═══ */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-end gap-2 border-t bg-background p-2.5"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Joindre un fichier"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          disabled
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez un message…"
          className="h-9 flex-1 text-sm"
          disabled={sendMutation.isPending || accessDenied}
          maxLength={2000}
          aria-label="Écrire un message"
        />

        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
          disabled={!message.trim() || sendMutation.isPending || accessDenied}
          aria-label="Envoyer le message"
        >
          {sendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}