// src/store/messagerie.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface Message {
  id: string;
  conversationId: string;
  expediteurId: string;
  contenu: string;
  createdAt: string;
  lu?: boolean;
  expediteur?: {
    id: string;
    nom: string;
    prenom: string;
    photoUrl?: string | null;
  };
}

export interface Conversation {
  id: string;
  titre?: string | null;
  estGroupe: boolean;
  membres?: Array<{
    id: string;
    nom: string;
    prenom: string;
    photoUrl?: string | null;
    role?: { nom: string; libelle?: string };
  }>;
  dernierMessageAt?: string | null;
  nbNonLus?: number;
  messages?: Message[];
}

export interface TypingUser {
  userId: string;
  conversationId: string;
  expiresAt: number;
}

export interface MessagerieState {
  /* -------------------- CONVERSATIONS -------------------- */
  conversations: Conversation[];
  activeConversationId: string | null;
  unreadCount: number;

  /* -------------------- MESSAGES (par conversation) -------------------- */
  messagesByConversation: Record<string, Message[]>;

  /* -------------------- TYPING -------------------- */
  typingUsers: Record<string, TypingUser[]>;

  /* -------------------- ACTIONS — CONVERSATIONS -------------------- */
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  incrementUnread: (conversationId: string) => void;
  resetUnread: (conversationId: string) => void;

  /* -------------------- ACTIONS — MESSAGES -------------------- */
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<Message>,
  ) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  clearMessages: (conversationId: string) => void;

  /* -------------------- ACTIONS — TYPING -------------------- */
  setTyping: (conversationId: string, userId: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
  clearAllTyping: (conversationId?: string) => void;

  /* -------------------- HELPERS -------------------- */
  getConversation: (id: string) => Conversation | undefined;
  getMessages: (conversationId: string) => Message[];
  isTyping: (conversationId: string, userId?: string) => boolean;

  /* -------------------- RESET -------------------- */
  clear: () => void;
}

/* ============================================================================
   CONSTANTES
   ============================================================================ */

const TYPING_TIMEOUT = 3_000;

/* ============================================================================
   STORE
   ============================================================================ */

export const useMessagerieStore = create<MessagerieState>()(
  persist(
    (set, get) => ({
      /* -------------------- ÉTAT INITIAL -------------------- */
      conversations: [],
      activeConversationId: null,
      unreadCount: 0,
      messagesByConversation: {},
      typingUsers: {},

      /* ==================== CONVERSATIONS ==================== */

      setConversations: (conversations) =>
        set({
          conversations,
          unreadCount: conversations.reduce(
            (sum, c) => sum + (c.nbNonLus ?? 0),
            0,
          ),
        }),

      addConversation: (conversation) =>
        set((state) => {
          if (state.conversations.some((c) => c.id === conversation.id)) {
            return state;
          }
          return {
            conversations: [conversation, ...state.conversations],
          };
        }),

      updateConversation: (id, patch) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      removeConversation: (id) =>
        set((state) => {
          const { [id]: _, ...remainingMessages } =
            state.messagesByConversation;
          const { [id]: __, ...remainingTyping } = state.typingUsers;

          return {
            conversations: state.conversations.filter((c) => c.id !== id),
            messagesByConversation: remainingMessages,
            typingUsers: remainingTyping,
            activeConversationId:
              state.activeConversationId === id
                ? null
                : state.activeConversationId,
          };
        }),

      setActiveConversation: (id) =>
        set((state) => {
          const conversations = state.conversations.map((c) =>
            c.id === id ? { ...c, nbNonLus: 0 } : c,
          );

          return {
            activeConversationId: id,
            conversations,
            unreadCount: conversations.reduce(
              (sum, c) => sum + (c.nbNonLus ?? 0),
              0,
            ),
          };
        }),

      incrementUnread: (conversationId) =>
        set((state) => {
          const conversations = state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, nbNonLus: (c.nbNonLus ?? 0) + 1 }
              : c,
          );

          return {
            conversations,
            unreadCount: state.unreadCount + 1,
          };
        }),

      resetUnread: (conversationId) =>
        set((state) => {
          const conv = state.conversations.find(
            (c) => c.id === conversationId,
          );
          const nb = conv?.nbNonLus ?? 0;

          return {
            conversations: state.conversations.map((c) =>
              c.id === conversationId ? { ...c, nbNonLus: 0 } : c,
            ),
            unreadCount: Math.max(0, state.unreadCount - nb),
          };
        }),

      /* ==================== MESSAGES ==================== */

      setMessages: (conversationId, messages) =>
        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: messages,
          },
        })),

      addMessage: (message) =>
        set((state) => {
          const cid = message.conversationId;
          const list = state.messagesByConversation[cid] ?? [];

          // Éviter les doublons
          if (list.some((m) => m.id === message.id)) return state;

          const newMessages = [...list, message];
          const isActive = state.activeConversationId === cid;

          // Mettre à jour la conversation
          const conversations = state.conversations.map((c) => {
            if (c.id !== cid) return c;
            return {
              ...c,
              dernierMessageAt: message.createdAt,
              nbNonLus: isActive ? 0 : (c.nbNonLus ?? 0) + 1,
              messages: c.messages
                ? [message, ...c.messages.slice(0, 19)]
                : [message],
            };
          });

          // Remonter la conversation en haut
          const sorted = [...conversations].sort((a, b) => {
            const dateA = a.dernierMessageAt
              ? new Date(a.dernierMessageAt).getTime()
              : 0;
            const dateB = b.dernierMessageAt
              ? new Date(b.dernierMessageAt).getTime()
              : 0;
            return dateB - dateA;
          });

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [cid]: newMessages,
            },
            conversations: sorted,
            unreadCount: isActive
              ? state.unreadCount
              : state.unreadCount + 1,
          };
        }),

      updateMessage: (conversationId, messageId, patch) =>
        set((state) => {
          const list = state.messagesByConversation[conversationId];
          if (!list) return state;

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: list.map((m) =>
                m.id === messageId ? { ...m, ...patch } : m,
              ),
            },
          };
        }),

      removeMessage: (conversationId, messageId) =>
        set((state) => {
          const list = state.messagesByConversation[conversationId];
          if (!list) return state;

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: list.filter((m) => m.id !== messageId),
            },
          };
        }),

      clearMessages: (conversationId) =>
        set((state) => {
          const { [conversationId]: _, ...remaining } =
            state.messagesByConversation;
          return { messagesByConversation: remaining };
        }),

      /* ==================== TYPING ==================== */

      setTyping: (conversationId, userId) =>
        set((state) => {
          const list = state.typingUsers[conversationId] ?? [];
          const existing = list.find((t) => t.userId === userId);
          const expiresAt = Date.now() + TYPING_TIMEOUT;

          const newList = existing
            ? list.map((t) =>
                t.userId === userId ? { ...t, expiresAt } : t,
              )
            : [...list, { userId, conversationId, expiresAt }];

          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: newList,
            },
          };
        }),

      clearTyping: (conversationId, userId) =>
        set((state) => {
          const list = state.typingUsers[conversationId] ?? [];
          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: list.filter((t) => t.userId !== userId),
            },
          };
        }),

      clearAllTyping: (conversationId) =>
        set((state) => {
          if (conversationId) {
            const { [conversationId]: _, ...remaining } = state.typingUsers;
            return { typingUsers: remaining };
          }
          return { typingUsers: {} };
        }),

      /* ==================== HELPERS ==================== */

      getConversation: (id) =>
        get().conversations.find((c) => c.id === id),

      getMessages: (conversationId) =>
        get().messagesByConversation[conversationId] ?? [],

      isTyping: (conversationId, userId) => {
        const list = get().typingUsers[conversationId] ?? [];
        const now = Date.now();
        const active = list.filter((t) => t.expiresAt > now);

        if (!userId) return active.length > 0;
        return active.some((t) => t.userId === userId);
      },

      /* ==================== RESET ==================== */

      clear: () =>
        set({
          conversations: [],
          activeConversationId: null,
          unreadCount: 0,
          messagesByConversation: {},
          typingUsers: {},
        }),
    }),
    {
      name: 'odc-messagerie',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations.slice(0, 30),
        unreadCount: state.unreadCount,
      }),
      version: 1,
    },
  ),
);

/* ============================================================================
   SÉLECTEURS
   ============================================================================ */

export const selectConversations = (s: MessagerieState) => s.conversations;
export const selectActiveConversationId = (s: MessagerieState) =>
  s.activeConversationId;
export const selectUnreadMessageCount = (s: MessagerieState) => s.unreadCount;

export const selectMessages =
  (conversationId: string) => (s: MessagerieState) =>
    s.messagesByConversation[conversationId] ?? [];

export const selectIsTyping =
  (conversationId: string, userId?: string) => (s: MessagerieState) => {
    const list = s.typingUsers[conversationId] ?? [];
    const now = Date.now();
    const active = list.filter((t) => t.expiresAt > now);

    if (!userId) return active.length > 0;
    return active.some((t) => t.userId === userId);
  };