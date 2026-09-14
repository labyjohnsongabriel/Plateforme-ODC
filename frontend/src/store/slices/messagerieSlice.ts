import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { messagerieApi } from '@/services/messagerie.api';
import type { Conversation, Message } from '@/types/messagerie.types';

interface MessagerieState {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  sending: boolean;
  totalNonLus: number;
  error: string | null;
}

const initialState: MessagerieState = {
  conversations: [],
  selectedConversationId: null,
  messages: {},
  loading: false,
  sending: false,
  totalNonLus: 0,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'messagerie/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await messagerieApi.mesConversations();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messagerie/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await messagerieApi.getMessages(conversationId);
      return { conversationId, messages: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messagerie/sendMessage',
  async (
    payload: { conversationId: string; contenu: string },
    { rejectWithValue }
  ) => {
    try {
      const message = await messagerieApi.envoyer(payload.conversationId, {
        contenu: payload.contenu,
      });
      return { conversationId: payload.conversationId, message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

const messagerieSlice = createSlice({
  name: 'messagerie',
  initialState,
  reducers: {
    selectConversation: (state, action: PayloadAction<string>) => {
      state.selectedConversationId = action.payload;
    },
    addMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>
    ) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },
    clearUnread: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        state.totalNonLus -= conv.nonLus || 0;
        conv.nonLus = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.totalNonLus = action.payload.reduce((sum, c) => sum + (c.nonLus || 0), 0);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.conversationId] = action.payload.messages;
      });

    builder
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  selectConversation,
  addMessage,
  updateConversation,
  clearUnread,
} = messagerieSlice.actions;

export default messagerieSlice.reducer;