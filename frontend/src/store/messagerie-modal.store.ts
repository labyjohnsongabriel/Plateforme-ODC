// src/store/messagerie-modal.store.ts
import { create } from 'zustand';

interface MessagerieModalState {
  isOpen: boolean;
  conversationId: string | null;
  open: (conversationId?: string | null) => void;
  close: () => void;
  setConversation: (id: string | null) => void;
}

export const useMessagerieModalStore = create<MessagerieModalState>((set) => ({
  isOpen: false,
  conversationId: null,

  open: (conversationId = null) =>
    set({ isOpen: true, conversationId }),

  close: () => set({ isOpen: false, conversationId: null }),

  setConversation: (id) => set({ conversationId: id }),
}));