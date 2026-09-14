// ============================================================================
//  FEATURE MESSAGERIE — Index des exports
// ============================================================================

// ✅ Page principale
export { MessageriePage } from './pages/MessageriePage';

// Services
export { MessagerieService } from './services/messagerie.service';

// Hooks
export { useConversations } from './hooks/useConversations';
export { useMessages } from './hooks/useMessages';
export { useSocket, getSocket, disconnectSocket } from './hooks/useSocket';

// Composants
export { ConversationList } from './components/ConversationList';
export { ConversationItem } from './components/ConversationItem';
export { ChatWindow } from './components/ChatWindow';
export { MessageBubble } from './components/MessageBubble';
export { MessageInput } from './components/MessageInput';
export { TypingIndicator } from './components/TypingIndicator';
export { NewConversationModal } from './components/NewConversationModal';

// Types
export * from './types/messagerie.types';