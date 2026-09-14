import { messagerieApi } from '@/services/messagerie.api';
import type {
  Conversation,
  Message,
  CreatePrivateConversationPayload,
  CreateGroupConversationPayload,
  SendMessagePayload,
} from '../types/messagerie.types';

// ============================================================================
//  MESSAGERIE SERVICE
// ============================================================================

export class MessagerieService {
  /**
   * Liste des conversations
   */
  static async getConversations(): Promise<Conversation[]> {
    return messagerieApi.mesConversations();
  }

  /**
   * Créer ou récupérer une conversation privée
   */
  static async createPrivate(payload: CreatePrivateConversationPayload): Promise<Conversation> {
    return messagerieApi.createPrivate(payload);
  }

  /**
   * Créer un groupe
   */
  static async createGroupe(payload: CreateGroupConversationPayload): Promise<Conversation> {
    return messagerieApi.createGroupe(payload);
  }

  /**
   * Récupérer les messages
   */
  static async getMessages(conversationId: string, page = 1, limit = 50) {
    return messagerieApi.getMessages(conversationId, { page, limit });
  }

  /**
   * Envoyer un message
   */
  static async envoyer(conversationId: string, payload: SendMessagePayload): Promise<Message> {
    return messagerieApi.envoyer(conversationId, payload);
  }

  /**
   * Marquer comme lus
   */
  static async marquerLus(conversationId: string): Promise<void> {
    return messagerieApi.marquerLus(conversationId);
  }

  /**
   * Nombre de messages non lus
   */
  static async countNonLus(): Promise<number> {
    const data = await messagerieApi.countNonLus();
    return data.count;
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Nom d'affichage d'une conversation
   */
  static getDisplayName(conversation: Conversation, currentUserId: string): string {
    if (conversation.titre) return conversation.titre;
    if (conversation.estGroupe) return `Groupe (${conversation.membres.length})`;

    const other = conversation.membres?.find((m) => m.id !== currentUserId);
    return other ? `${other.prenom} ${other.nom}` : 'Conversation';
  }

  /**
   * Avatar/initiale d'une conversation
   */
  static getAvatar(conversation: Conversation, currentUserId: string): {
    name: string;
    photoUrl?: string;
    isGroup: boolean;
  } {
    if (conversation.estGroupe) {
      return { name: conversation.titre || 'Groupe', isGroup: true };
    }
    const other = conversation.membres?.find((m) => m.id !== currentUserId);
    return {
      name: other ? `${other.prenom} ${other.nom}` : 'Utilisateur',
      photoUrl: other?.photoUrl,
      isGroup: false,
    };
  }

  /**
   * Aperçu du dernier message
   */
  static formatLastMessage(conversation: Conversation): string {
    const msg = conversation.dernierMessage || conversation.messages?.[0];
    if (!msg) return 'Aucun message';

    if (msg.type === 'IMAGE') return '📷 Image';
    if (msg.type === 'FICHIER') return '📎 Fichier';

    return msg.contenu?.substring(0, 50) || 'Message';
  }

  /**
   * Trier conversations par date
   */
  static sortByRecent(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((a, b) => {
      const dateA = new Date(a.dernierMessageAt || a.updatedAt).getTime();
      const dateB = new Date(b.dernierMessageAt || b.updatedAt).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Compter les non lus
   */
  static countNonLusInConversation(conversation: Conversation, currentUserId: string): number {
    if (conversation.nonLus !== undefined) return conversation.nonLus;

    return (
      conversation.messages?.filter((m) => !m.lu && m.expediteurId !== currentUserId).length || 0
    );
  }
}