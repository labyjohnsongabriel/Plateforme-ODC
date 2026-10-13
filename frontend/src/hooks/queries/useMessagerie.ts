// src/hooks/queries/useMessagerie.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import { useSocket } from '@/hooks/useSocket';
import { useMessagerieStore } from '@/store/messagerie.store';
import type {
  Conversation,
  ConversationFilters,
  Message,
  MessageFilters,
  CreatePrivateConversationInput,
  CreateGroupConversationInput,
  SendMessageInput,
  PaginatedResponse,
} from '@/types/messagerie.types';

/* ============================================================================
   QUERIES — CONVERSATIONS
   ============================================================================ */

export function useConversations(filters?: ConversationFilters) {
  return useQuery({
    queryKey: queryKeys.messagerie.conversations(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Conversation>;
      }>('/messagerie/conversations', { params: filters });
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.messagerie.conversation(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Conversation }>(
        `/messagerie/conversations/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useUnreadMessagesCount() {
  return useQuery({
    queryKey: queryKeys.messagerie.unreadCount,
    queryFn: async () => {
      const { data } = await api.get('/messagerie/non-lus/count');
      return data.data.count as number;
    },
    refetchInterval: 30_000,
  });
}

export function useConversationMembers(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messagerie.members(conversationId),
    queryFn: async () => {
      const { data } = await api.get(
        `/messagerie/conversations/${conversationId}/membres`,
      );
      return data.data;
    },
    enabled: !!conversationId,
  });
}

/* ============================================================================
   QUERIES — MESSAGES
   ============================================================================ */

export function useMessages(
  conversationId: string,
  filters?: MessageFilters,
) {
  return useQuery({
    queryKey: queryKeys.messagerie.messages(conversationId, filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: { conversation: Conversation; messages: Message[] };
      }>(`/messagerie/conversations/${conversationId}/messages`, {
        params: filters,
      });
      return data.data;
    },
    enabled: !!conversationId,
    refetchInterval: 10_000,
  });
}

export function useMessage(id: string) {
  return useQuery({
    queryKey: queryKeys.messagerie.message(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Message }>(
        `/messagerie/messages/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/* ============================================================================
   SOCKET — Temps réel
   ============================================================================ */

export function useMessagerieSocket(conversationId?: string) {
  const { socket } = useSocket();
  const qc = useQueryClient();
  const addMessage = useMessagerieStore((s) => s.addMessage);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      addMessage(msg);
      if (conversationId && msg.conversationId === conversationId) {
        qc.invalidateQueries({
          queryKey: queryKeys.messagerie.messages(conversationId),
        });
      }
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
    };

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      // Gérer l'indicateur de saisie
    };

    const handleRead = (data: { conversationId: string; messageId: string }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.messages(data.conversationId),
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:typing', handleTyping);
    socket.on('message:read', handleRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:typing', handleTyping);
      socket.off('message:read', handleRead);
    };
  }, [socket, conversationId, qc, addMessage]);
}

/* ============================================================================
   MUTATIONS — CONVERSATIONS
   ============================================================================ */

export function useCreatePrivateConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrivateConversationInput) => {
      const { data } = await api.post<{ data: Conversation }>(
        '/messagerie/conversations/privee',
        input,
      );
      return data.data;
    },
    onSuccess: (conv) => {
      toast.success('Conversation créée');
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
      qc.setQueryData(queryKeys.messagerie.conversation(conv.id), conv);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCreateGroupConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGroupConversationInput) => {
      const { data } = await api.post<{ data: Conversation }>(
        '/messagerie/conversations/groupe',
        input,
      );
      return data.data;
    },
    onSuccess: (conv) => {
      toast.success('Groupe créé');
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
      qc.setQueryData(queryKeys.messagerie.conversation(conv.id), conv);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: { titre?: string };
    }) => {
      const { data } = await api.put(
        `/messagerie/conversations/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: (_, { id }) => {
      toast.success('Conversation mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversation(id) });
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useArchiveConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(
        `/messagerie/conversations/${id}/archiver`,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Conversation archivée');
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/messagerie/conversations/${id}`);
    },
    onSuccess: () => {
      toast.success('Conversation supprimée');
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAddConversationMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      const { data } = await api.post(
        `/messagerie/conversations/${conversationId}/membres`,
        { userId },
      );
      return data.data;
    },
    onSuccess: (_, { conversationId }) => {
      toast.success('Membre ajouté');
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.conversation(conversationId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.members(conversationId),
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useRemoveConversationMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      await api.delete(
        `/messagerie/conversations/${conversationId}/membres/${userId}`,
      );
    },
    onSuccess: (_, { conversationId }) => {
      toast.success('Membre retiré');
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.conversation(conversationId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.members(conversationId),
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/* ============================================================================
   MUTATIONS — MESSAGES
   ============================================================================ */

export function useSendMessage() {
  const qc = useQueryClient();
  const { socket } = useSocket();

  return useMutation({
    mutationFn: async ({
      conversationId,
      input,
    }: {
      conversationId: string;
      input: SendMessageInput;
    }) => {
      const { data } = await api.post<{ data: Message }>(
        `/messagerie/conversations/${conversationId}/messages`,
        input,
      );
      return data.data;
    },
    onSuccess: (msg, { conversationId }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.messages(conversationId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
      socket?.emit('message:send', msg);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useEditMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      contenu,
    }: {
      id: string;
      contenu: string;
    }) => {
      const { data } = await api.put(`/messagerie/messages/${id}`, {
        contenu,
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Message modifié');
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/messagerie/messages/${id}`);
    },
    onSuccess: () => {
      toast.success('Message supprimé');
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useMarkMessagesAsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await api.put(
        `/messagerie/conversations/${conversationId}/marquer-lus`,
      );
    },
    onSuccess: (_, conversationId) => {
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.conversations() });
      qc.invalidateQueries({ queryKey: queryKeys.messagerie.unreadCount });
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.conversation(conversationId),
      });
    },
  });
}

export function useUploadMessageAttachment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      file,
      contenu,
    }: {
      conversationId: string;
      file: File;
      contenu?: string;
    }) => {
      const fd = new FormData();
      fd.append('fichier', file);
      if (contenu) fd.append('contenu', contenu);

      const { data } = await api.post(
        `/messagerie/conversations/${conversationId}/messages/fichier`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data.data;
    },
    onSuccess: (_, { conversationId }) => {
      toast.success('Fichier envoyé');
      qc.invalidateQueries({
        queryKey: queryKeys.messagerie.messages(conversationId),
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/* ============================================================================
   TYPING INDICATOR
   ============================================================================ */

export function useSendTypingIndicator() {
  const { socket } = useSocket();

  return (conversationId: string) => {
    socket?.emit('message:typing', { conversationId });
  };
}