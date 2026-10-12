'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, Users, Loader2, Paperclip,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';

interface Props {
  conversationId: string;
}

export function ChatWindow({ conversationId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { socket } = useSocket();
  const currentUser = useAuthStore((s) => s.user);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['messagerie', 'conversation', conversationId],
    queryFn: async () => {
      const { data } = await api.get(
        `/messagerie/conversations/${conversationId}/messages`,
      );
      return data.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      await api.post(
        `/messagerie/conversations/${conversationId}/messages`,
        { contenu: message },
      );
    },
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries({
        queryKey: ['messagerie', 'conversation', conversationId],
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  // Socket temps réel
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: any) => {
      if (msg.conversationId === conversationId) {
        qc.invalidateQueries({
          queryKey: ['messagerie', 'conversation', conversationId],
        });
      }
    };
    socket.on('message:new', handler);
    return () => {
      socket.off('message:new', handler);
    };
  }, [socket, conversationId, qc]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  if (isLoading || !data) {
    return <Skeleton className="h-full" />;
  }

  const { conversation, messages } = data;
  const other = conversation.estGroupe
    ? null
    : conversation.membres?.find((m: any) => m.id !== currentUser?.id);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-odc-border bg-odc-surface shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {conversation.estGroupe ? (
          <div className="w-10 h-10 rounded-full bg-odc-primary-soft flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-odc-primary" />
          </div>
        ) : (
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={other?.photoUrl ?? undefined} />
            <AvatarFallback className="bg-odc-primary-soft text-odc-primary font-display font-bold text-xs">
              {getInitials(other?.nom ?? '', other?.prenom ?? '')}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {conversation.estGroupe
              ? conversation.titre
              : `${other?.prenom ?? ''} ${other?.nom ?? ''}`}
          </p>
          <p className="text-xs text-odc-muted">
            {conversation.estGroupe
              ? `${conversation.membres?.length ?? 0} membres`
              : other?.role?.libelle ?? other?.role?.nom}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages?.length === 0 ? (
          <div className="text-center py-12 text-odc-muted text-sm">
            Aucun message. Démarrez la conversation !
          </div>
        ) : (
          messages.map((msg: any) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.expediteurId === currentUser?.id}
              showAvatar={conversation.estGroupe}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) sendMutation.mutate();
        }}
        className="p-4 border-t border-odc-border flex gap-2 shrink-0"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Joindre un fichier"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez un message…"
          className="flex-1"
        />
        <Button
          type="submit"
          variant="odc"
          size="icon"
          disabled={!message.trim() || sendMutation.isPending}
          aria-label="Envoyer"
        >
          {sendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  );
}