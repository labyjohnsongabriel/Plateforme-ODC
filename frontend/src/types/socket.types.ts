import type { Message } from './messagerie.types';
import type { Notification } from './notification.types';

export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'message:read': (data: { conversationId: string; userId: string }) => void;
  'notification:new': (notification: Notification) => void;
  'presence:update': (data: { sessionId: string; participantId: string }) => void;
  'connection:request': (data: any) => void;
}

export interface ClientToServerEvents {
  'message:send': (data: { conversationId: string; content: string }) => void;
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
  'presence:scan': (data: { sessionId: string; qrToken: string }) => void;
}