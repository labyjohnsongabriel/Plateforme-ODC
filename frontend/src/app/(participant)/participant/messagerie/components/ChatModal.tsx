// src/app/(participant)/participant/messagerie/components/ChatModal.tsx
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
  X,
  Search,
  ChevronLeft,
  MessageSquare,
  Circle,
  CheckCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
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
  onClose: () => void;
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

export function ChatModal({ conversationId, onClose }: Props) {
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
  const { data, isLoading, isError, isFetching, refetch } = useQuery<{
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
  });

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
    if (!socket) return;

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
  }, [socket, conversationId, qc, currentUser?.id]);

  /* ═══════════════════════════════════════════════════════════════════════
     MARQUER COMME LU
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!conversationId) return;
    void api
      .put(`/messagerie/conversations/${conversationId}/lu`)
      .then(() =>
        qc.invalidateQueries({ queryKey: ['messagerie', 'conversations'] }),
      )
      .catch(() => {
        /* silencieux */
      });
  }, [conversationId, qc]);

  /* ═══════════════════════════════════════════════════════════════════════
     AUTO-SCROLL
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  /* ═══════════════════════════════════════════════════════════════════════
     FOCUS AUTO
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [conversationId]);

  /* ═══════════════════════════════════════════════════════════════════════
     ENVOI
     ═══════════════════════════════════════════════════════════════════════ */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = message.trim();
      if (!trimmed || sendMutation.isPending) return;
      sendMutation.mutate(trimmed);
    },
    [message, sendMutation],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
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
     RENDU
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-2xl h-[85vh] flex flex-col overflow-hidden sm:rounded-2xl [&>button]:hidden"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        {/* ═══ HEADER ═══ */}
        <DialogHeader className="shrink-0 space-y-0 border-b bg-gradient-to-r from-primary/5 to-transparent p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="-ml-1 h-9 w-9 shrink-0"
              aria-label="Fermer la conversation"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </Button>

            {conversation?.estGroupe ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                <Users className="h-5 w-5 text-primary" aria-hidden />
              </div>
            ) : (
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/10">
                <AvatarImage src={other?.photoUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-display text-xs font-bold">
                  {getInitials(other?.nom ?? '', other?.prenom ?? '')}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-left font-display text-base font-semibold">
                {displayTitle}
              </DialogTitle>
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
              className={cn('h-9 w-9 shrink-0', searchOpen && 'bg-muted')}
              aria-label="Rechercher dans la conversation"
              aria-pressed={searchOpen}
            >
              <Search className="h-4 w-4" aria-hidden />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 shrink-0"
              aria-label="Fermer la conversation"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {searchOpen && (
            <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un message…"
                  className="h-9 pl-9 pr-20"
                  autoFocus
                />
                {searchQuery && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {filteredMessages.length} résultat
                    {filteredMessages.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogHeader>

        {/* ═══ BODY — MESSAGES ═══ */}
        <div className="scrollbar-thin flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-background px-4 py-4">
          {isError ? (
            <QueryErrorState
              onRetry={() => {
                void refetch();
              }}
              isRetrying={isFetching}
            />
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-end gap-2',
                    i % 2 === 0 ? 'justify-start' : 'justify-end',
                  )}
                >
                  {i % 2 === 0 && (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  )}
                  <Skeleton
                    className={cn(
                      'h-12 rounded-2xl',
                      i % 2 === 0 ? 'w-48' : 'w-36',
                    )}
                  />
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {searchQuery ? (
                  <Search className="h-7 w-7 text-primary" aria-hidden />
                ) : (
                  <MessageSquare className="h-7 w-7 text-primary" aria-hidden />
                )}
              </div>
              <p className="font-display font-semibold text-foreground">
                {searchQuery
                  ? 'Aucun message trouvé'
                  : 'Démarrez la conversation'}
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {searchQuery
                  ? `Aucun message ne correspond à « ${searchQuery} »`
                  : 'Envoyez votre premier message pour briser la glace 👋'}
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

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMine={msg.expediteurId === currentUser?.id}
                    showAvatar={conversation?.estGroupe ?? false}
                    compact={!!sameAuthor}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </>
          )}
        </div>

        {/* ═══ FOOTER — INPUT ═══ */}
        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-end gap-2 border-t bg-background p-3"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Joindre un fichier"
            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
            disabled
          >
            <Paperclip className="h-5 w-5" aria-hidden />
          </Button>

          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message…"
              className="h-10 pr-3"
              disabled={sendMutation.isPending}
              maxLength={2000}
              aria-label="Écrire un message"
            />
          </div>

          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
            disabled={!message.trim() || sendMutation.isPending}
            aria-label="Envoyer le message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}