import { z } from 'zod';

// ============================================================================
//  ENUMS
// ============================================================================

export enum TypeMessage {
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE',
  FICHIER = 'FICHIER',
  SYSTEME = 'SYSTEME',
}

// ============================================================================
//  SCHÉMAS ZOD
// ============================================================================

export const sendMessageSchema = z.object({
  contenu: z.string().min(1, 'Message requis').max(5000, 'Maximum 5000 caractères'),
});

export const createGroupSchema = z.object({
  titre: z.string().min(2, 'Minimum 2 caractères').max(200),
  membreIds: z.array(z.string().uuid()).min(1, 'Sélectionnez au moins un membre'),
});

// ============================================================================
//  TYPES
// ============================================================================

export interface ConversationMember {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  photoUrl?: string;
  role?: { nom: string };
}

export interface Message {
  id: string;
  conversationId: string;
  expediteurId: string;
  expediteur?: ConversationMember;
  contenu?: string;
  type: TypeMessage;
  lu: boolean;
  dateLecture?: string;
  fichierUrl?: string;
  fichierNom?: string;
  fichierTaille?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  titre?: string;
  estGroupe: boolean;
  photoUrl?: string;
  membres: ConversationMember[];
  messages?: Message[];
  dernierMessage?: Message;
  dernierMessageAt?: string;
  nonLus?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrivateConversationPayload {
  userId: string;
}

export interface CreateGroupConversationPayload {
  titre: string;
  membreIds: string[];
}

export interface SendMessagePayload {
  contenu: string;
  fichierUrl?: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
}

export interface MessagerieStats {
  totalConversations: number;
  totalMessages: number;
  nonLus: number;
}

export type SendMessageFormData = z.infer<typeof sendMessageSchema>;
export type CreateGroupFormData = z.infer<typeof createGroupSchema>;