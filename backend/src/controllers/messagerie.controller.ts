// src/controllers/MessagerieController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Conversation } from '../entities/Conversation.entity';
import { Message } from '../entities/Message.entity';
import { User } from '../entities/User.entity';
import { TypeMessage } from '../entities/enums';
import { successResponse } from '../utils/response.util';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import { In } from 'typeorm';

export class MessagerieController {
  // ==========================================================================
  // 💬 CONVERSATIONS
  // ==========================================================================

  /** GET /api/messagerie/conversations */
  static async mesConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await AppDataSource.getRepository(Conversation)
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.membres', 'm')
        .leftJoinAndSelect('m.role', 'r')
        .where((qb) => {
          const sub = qb.subQuery()
            .select('cm.conversation_id')
            .from('conversation_membres', 'cm')
            .where('cm.user_id = :uid', { uid: req.userId! })
            .getQuery();
          return 'c.id IN ' + sub;
        })
        .orderBy('c.dernier_message_at', 'DESC', 'NULLS LAST')
        .getMany();

      return successResponse(res, conversations, 'Mes conversations');
    } catch (e) { next(e); }
  }

  /** GET /api/messagerie/conversations/:id */
  static async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres', 'membres.role'],
      });
      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === req.userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      return successResponse(res, conv, 'Conversation récupérée');
    } catch (e) { next(e); }
  }

  /** POST /api/messagerie/conversations/privee */
  static async createPrivate(req: Request, res: Response, next: NextFunction) {
    try {
      const { destinataireId } = req.body;
      if (!destinataireId) throw new BadRequestError('destinataireId requis');
      if (destinataireId === req.userId) {
        throw new BadRequestError('Impossible de créer une conversation avec soi-même');
      }

      const destinataire = await AppDataSource.getRepository(User).findOne({
        where: { id: destinataireId },
      });
      if (!destinataire) throw new NotFoundError('Destinataire introuvable');

      const repo = AppDataSource.getRepository(Conversation);

      // Vérifier si une conversation privée existe déjà
      const existing = await repo.createQueryBuilder('c')
        .leftJoin('c.membres', 'm')
        .where('c.est_groupe = false')
        .andWhere('m.id IN (:...ids)', { ids: [req.userId!, destinataireId] })
        .groupBy('c.id')
        .having('COUNT(m.id) = 2')
        .getOne();
      if (existing) return successResponse(res, existing, 'Conversation existante');

      const moi = await AppDataSource.getRepository(User).findOne({
        where: { id: req.userId! },
      });
      if (!moi) throw new NotFoundError('Utilisateur introuvable');

      const conv = repo.create({
        estGroupe: false,
        membres: [moi, destinataire],
        dernierMessageAt: new Date(),
      });
      await repo.save(conv);

      logger.info(`💬 Conversation privée créée : ${moi.id} ↔ ${destinataire.id}`);
      return successResponse(res, conv, 'Conversation créée', 201);
    } catch (e) { next(e); }
  }

  /** POST /api/messagerie/conversations/groupe */
  static async createGroupe(req: Request, res: Response, next: NextFunction) {
    try {
      const { titre, membreIds, photoUrl } = req.body;
      if (!titre || !Array.isArray(membreIds) || membreIds.length === 0) {
        throw new BadRequestError('titre et membreIds requis');
      }

      const ids = [...new Set([...membreIds, req.userId!])];
      const membres = await AppDataSource.getRepository(User).find({
        where: { id: In(ids) },
      });
      if (membres.length !== ids.length) {
        throw new BadRequestError('Certains membres sont introuvables');
      }

      const repo = AppDataSource.getRepository(Conversation);
      const conv = repo.create({
        titre,
        estGroupe: true,
        membres,
        photoUrl,
        dernierMessageAt: new Date(),
      });
      await repo.save(conv);

      logger.info(`👥 Groupe créé : ${titre} (${membres.length} membres)`);
      return successResponse(res, conv, 'Groupe créé', 201);
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // ✉️ MESSAGES
  // ==========================================================================

  /** GET /api/messagerie/conversations/:id/messages */
  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres'],
      });
      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === req.userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      const limit = Math.min(200, Number(req.query.limit) || 100);

      const messages = await AppDataSource.getRepository(Message).find({
        where: { conversationId: conv.id },
        relations: ['expediteur', 'expediteur.role'],
        order: { createdAt: 'ASC' },
        take: limit,
      });

      return successResponse(res, { conversation: conv, messages }, 'Messages récupérés');
    } catch (e) { next(e); }
  }

  /** POST /api/messagerie/conversations/:id/messages */
  static async envoyer(req: Request, res: Response, next: NextFunction) {
    try {
      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres'],
      });
      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === req.userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      const { contenu, type, fichierUrl, fichierNom, fichierTaille } = req.body;

      if (!contenu && !fichierUrl) {
        throw new BadRequestError('Message vide (contenu ou fichier requis)');
      }

      const repo = AppDataSource.getRepository(Message);
      const msg = repo.create({
        conversationId: conv.id,
        expediteurId: req.userId!,
        contenu,
        type: (type as TypeMessage) || TypeMessage.TEXTE,
        fichierUrl,
        fichierNom,
        fichierTaille,
      });
      await repo.save(msg);

      // Mettre à jour la date du dernier message
      conv.dernierMessageAt = new Date();
      await AppDataSource.getRepository(Conversation).save(conv);

      return successResponse(res, msg, 'Message envoyé', 201);
    } catch (e) { next(e); }
  }

  /** PUT /api/messagerie/conversations/:id/lus */
  static async marquerLus(req: Request, res: Response, next: NextFunction) {
    try {
      // Vérifier l'accès
      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres'],
      });
      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === req.userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      await AppDataSource.getRepository(Message)
        .createQueryBuilder()
        .update(Message)
        .set({ lu: true, dateLecture: new Date() })
        .where('conversation_id = :cid', { cid: req.params.id })
        .andWhere('expediteur_id != :uid', { uid: req.userId! })
        .andWhere('lu = false')
        .execute();

      return successResponse(res, null, 'Messages marqués comme lus');
    } catch (e) { next(e); }
  }

  /** DELETE /api/messagerie/messages/:id */
  static async supprimerMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = AppDataSource.getRepository(Message);
      const msg = await repo.findOne({
        where: { id: req.params.id },
        relations: ['conversation', 'conversation.membres'],
      });
      if (!msg) throw new NotFoundError('Message introuvable');

      // Seul l'expéditeur peut supprimer son message
      if (msg.expediteurId !== req.userId) {
        throw new ForbiddenError('Vous ne pouvez supprimer que vos propres messages');
      }

      await repo.softDelete(req.params.id);
      logger.info(`🗑️ Message supprimé : ${req.params.id}`);

      return successResponse(res, null, 'Message supprimé');
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 🔔 COMPTEURS
  // ==========================================================================

  /** GET /api/messagerie/non-lus/count */
  static async countNonLus(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await AppDataSource.getRepository(Message)
        .createQueryBuilder('m')
        .leftJoin('m.conversation', 'c')
        .leftJoin('c.membres', 'u')
        .where('u.id = :uid', { uid: req.userId! })
        .andWhere('m.expediteur_id != :uid', { uid: req.userId! })
        .andWhere('m.lu = false')
        .getCount();

      return successResponse(res, { count }, 'Messages non lus');
    } catch (e) { next(e); }
  }
}