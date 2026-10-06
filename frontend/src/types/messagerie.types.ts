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
}