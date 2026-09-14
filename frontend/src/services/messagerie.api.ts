import { api } from '@/lib/api';
import type { ApiResponse, ID } from '@/types/common.types';
import type {
  Conversation,
  Message,
  SendMessagePayload,
} from '@/types/messagerie.types';

export interface CreateConversationPayload {
  participantIds: ID[];
  titre?: string;
}

export const messagerieApi = {
  getConversations: () =>
    api.get<unknown, ApiResponse<Conversation[]>>('/messagerie/conversations'),

  getConversation: (id: ID) =>
    api.get<unknown, ApiResponse<Conversation>>(`/messagerie/conversations/${id}`),

  createConversation: (payload: CreateConversationPayload) =>
    api.post<unknown, ApiResponse<Conversation>>(
      '/messagerie/conversations',
      payload
    ),

  getMessages: (conversationId: ID) =>
    api.get<unknown, ApiResponse<Message[]>>(
      `/messagerie/conversations/${conversationId}/messages`
    ),

  sendMessage: (conversationId: ID, payload: SendMessagePayload) =>
    api.post<unknown, ApiResponse<Message>>(
      `/messagerie/conversations/${conversationId}/messages`,
      payload
    ),

  getUnreadCount: () =>
    api.get<unknown, ApiResponse<{ count: number }>>('/messagerie/unread-count'),

  deleteConversation: (id: ID) =>
    api.delete<unknown, ApiResponse<void>>(`/messagerie/conversations/${id}`),
};