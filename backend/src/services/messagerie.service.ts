// src/services/messagerie.service.ts
import { conversationRepository } from '../repositories/ConversationRepository';
import { messageRepository } from '../repositories/message.repository';
import { userRepository } from '../repositories/user.repository';
import { TypeMessage } from '../entities/enums';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/AppError';
import { In } from 'typeorm';

export class MessagerieService {
  static async mesConversations(userId: string) {
    return conversationRepository.findForUser(userId);
  }

  static async createPrivate(userId: string, destinataireId: string) {
    if (userId === destinataireId) throw new BadRequestError('Impossible de créer une conversation avec soi-même');
    const destinataire = await userRepository.findById(destinataireId);
    if (!destinataire) throw new NotFoundError('Destinataire introuvable');

    const existing = await conversationRepository.findPrivateBetween(userId, destinataireId);
    if (existing) return existing;

    const moi = await userRepository.findByIdOrFail(userId);
    return conversationRepository.create({
      estGroupe: false,
      membres: [moi, destinataire],
      dernierMessageAt: new Date(),
    });
  }

  static async createGroupe(userId: string, titre: string, membreIds: string[], photoUrl?: string) {
    if (!titre || !membreIds.length) throw new BadRequestError('titre et membres requis');
    const ids = [...new Set([...membreIds, userId])];
    const membres = await userRepository.findMany({ where: { id: In(ids) } } as any);
    if (membres.length !== ids.length) throw new BadRequestError('Certains membres sont introuvables');

    return conversationRepository.create({
      titre, estGroupe: true, membres, photoUrl,
      dernierMessageAt: new Date(),
    });
  }

  static async getConversation(conversationId: string, userId: string) {
    const conv = await conversationRepository.findByIdWithMembres(conversationId);
    if (!conv) throw new NotFoundError('Conversation introuvable');
    if (!conv.membres.some((m) => m.id === userId)) throw new ForbiddenError('Accès refusé');
    return conv;
  }

  static async getMessages(conversationId: string, userId: string, limit = 100) {
    await this.getConversation(conversationId, userId); // Vérifie accès
    return messageRepository.findByConversation(conversationId, limit);
  }

  static async envoyer(
    conversationId: string,
    userId: string,
    data: { contenu?: string; type?: TypeMessage; fichierUrl?: string; fichierNom?: string; fichierTaille?: number },
  ) {
    const conv = await this.getConversation(conversationId, userId);
    if (!data.contenu && !data.fichierUrl) throw new BadRequestError('Message vide');

    const msg = await messageRepository.create({
      conversationId: conv.id,
      expediteurId: userId,
      contenu: data.contenu,
      type: data.type ?? TypeMessage.TEXTE,
      fichierUrl: data.fichierUrl,
      fichierNom: data.fichierNom,
      fichierTaille: data.fichierTaille,
    });

    conv.dernierMessageAt = new Date();
    await conversationRepository.save(conv);

    return msg;
  }

  static async marquerLus(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);
    return messageRepository.marquerLus(conversationId, userId);
  }

  static async countNonLus(userId: string) {
    const count = await messageRepository.countNonLus(userId);
    return { count };
  }
}