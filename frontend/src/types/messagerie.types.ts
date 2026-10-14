<<<<<<< HEAD
import { ID, Timestamp, PaginationParams } from './common.types';
import { User } from './user.types';

export enum TypeMessage {
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE',
  FICHIER = 'FICHIER',
  SYSTEME = 'SYSTEME',
}

export interface Conversation {
  id: ID;
  titre?: string;
  estGroupe: boolean;
  photoUrl?: string;
  membres: User[];
  messages?: Message[];
  dernierMessage?: Message;
  dernierMessageAt?: Timestamp;
  nonLus?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: ID;
  conversation: Conversation;
  conversationId: ID;
  expediteur: User;
  expediteurId: ID;
  contenu?: string;
  type: TypeMessage;
  lu: boolean;
  dateLecture?: Timestamp;
  fichierUrl?: string;
  fichierNom?: string;
  fichierTaille?: number;
  createdAt: Timestamp;
}

export interface CreatePrivateConversationPayload {
  userId: ID;
}

export interface CreateGroupConversationPayload {
  titre: string;
  membreIds: ID[];
}

export interface SendMessagePayload {
  contenu: string;
  fichierUrl?: string;
}

export interface TypingUser {
  userId: ID;
  userName: string;
  conversationId: ID;
}

export interface MessageFilters extends PaginationParams {
  conversationId?: ID;
}

export interface NonLusCount {
  count: number;
=======
import type { User } from './user.types';

export type TypeMessage = 'TEXTE' | 'IMAGE' | 'FICHIER' | 'SYSTEME';

export interface Conversation {
  id: string;
  titre?: string;
  estGroupe: boolean;
  photoUrl?: string;
  dernierMessageAt?: string;
  membres: User[];
  messages?: Message[];
  createdAt: string;
}

export interface Message {
  id: string;
  contenu?: string;
  type: TypeMessage;
  lu: boolean;
  dateLecture?: string;
  fichierUrl?: string;
  fichierNom?: string;
  fichierTaille?: number;
  conversation: Conversation;
  conversationId: string;
  expediteur: User;
  expediteurId: string;
  createdAt: string;
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
}