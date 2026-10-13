<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response.util';

export class MessagerieController {
  static async mesConversations(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, []); } catch (e) { next(e); }
  }
  static async createPrivate(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Conversation creee', 201); } catch (e) { next(e); }
  }
  static async createGroupe(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Groupe cree', 201); } catch (e) { next(e); }
  }
  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, { data: [], total: 0 }); } catch (e) { next(e); }
  }
  static async envoyer(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, {}, 'Message envoye', 201); } catch (e) { next(e); }
  }
  static async marquerLus(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, null, 'Messages lus'); } catch (e) { next(e); }
  }
  static async countNonLus(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, { count: 0 }); } catch (e) { next(e); }
=======
// src/controllers/MessagerieController.ts
import { Request, Response, NextFunction } from 'express';
import { In } from 'typeorm';
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

/* ============================================================================
   HELPERS
   ============================================================================ */

function getUserId(req: Request): string {
  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) throw new BadRequestError('Utilisateur non authentifié');
  return userId;
}

/* ============================================================================
   CONTROLLER
   ============================================================================ */

export class MessagerieController {
  /* ==========================================================================
     💬 CONVERSATIONS
     ========================================================================== */

  static async mesConversations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      // ⭐ Utilise les PROPRIÉTÉS TypeScript (pas les colonnes DB)
      const conversations = await AppDataSource.getRepository(Conversation)
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.membres', 'm')
        .leftJoinAndSelect('m.role', 'r')
        .innerJoin('c.membres', 'me', 'me.id = :uid', { uid: userId })
        .orderBy('c.dernierMessageAt', 'DESC', 'NULLS LAST') // ⭐ Camelcase
        .getMany();

      return successResponse(res, conversations, 'Mes conversations');
    } catch (e) {
      next(e);
    }
  }

  static async getConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres', 'membres.role'],
      });

      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      return successResponse(res, conv, 'Conversation récupérée');
    } catch (e) {
      next(e);
    }
  }

  static async createPrivate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { destinataireId } = req.body;

      if (!destinataireId) {
        throw new BadRequestError('destinataireId requis');
      }
      if (destinataireId === userId) {
        throw new BadRequestError(
          'Impossible de créer une conversation avec soi-même',
        );
      }

      const userRepo = AppDataSource.getRepository(User);

      const destinataire = await userRepo.findOne({
        where: { id: destinataireId },
      });
      if (!destinataire) {
        throw new NotFoundError('Destinataire introuvable');
      }

      const repo = AppDataSource.getRepository(Conversation);

      // ⭐ Vérifier si conversation privée existante
      // Utilise estGroupe (propriété TS)
      const existing = await repo
        .createQueryBuilder('c')
        .leftJoin('c.membres', 'm')
        .where('c.estGroupe = :isGroup', { isGroup: false })
        .andWhere('m.id IN (:...ids)', { ids: [userId, destinataireId] })
        .groupBy('c.id')
        .having('COUNT(m.id) = 2')
        .getOne();

      if (existing) {
        return successResponse(res, existing, 'Conversation existante');
      }

      const moi = await userRepo.findOne({ where: { id: userId } });
      if (!moi) throw new NotFoundError('Utilisateur introuvable');

      const conv = repo.create({
        estGroupe: false,
        membres: [moi, destinataire],
        dernierMessageAt: new Date(),
      });

      await repo.save(conv);

      logger.info(
        `💬 Conversation privée créée : ${moi.id} ↔ ${destinataire.id}`,
      );

      return successResponse(res, conv, 'Conversation créée', 201);
    } catch (e) {
      next(e);
    }
  }

  static async createGroupe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { titre, membreIds, photoUrl } = req.body;

      if (!titre || typeof titre !== 'string') {
        throw new BadRequestError('Titre requis');
      }
      if (!Array.isArray(membreIds) || membreIds.length === 0) {
        throw new BadRequestError('membreIds requis (tableau non vide)');
      }

      const ids = [...new Set([...membreIds, userId])];

      const membres = await AppDataSource.getRepository(User).find({
        where: { id: In(ids) },
      });

      if (membres.length !== ids.length) {
        throw new BadRequestError('Certains membres sont introuvables');
      }

      const repo = AppDataSource.getRepository(Conversation);

      const conv = repo.create({
        titre: titre.trim(),
        estGroupe: true,
        membres,
        photoUrl,
        dernierMessageAt: new Date(),
      });

      await repo.save(conv);

      logger.info(`👥 Groupe créé : ${titre} (${membres.length} membres)`);

      return successResponse(res, conv, 'Groupe créé', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     ✉️ MESSAGES
     ========================================================================== */

  static async getMessages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres', 'membres.role'],
      });

      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      const limit = Math.min(200, Number(req.query.limit) || 100);

      const messages = await AppDataSource.getRepository(Message).find({
        where: { conversationId: conv.id }, // ⭐ Propriété TS
        relations: ['expediteur', 'expediteur.role'],
        order: { createdAt: 'ASC' }, // ⭐ Propriété TS
        take: limit,
      });

      return successResponse(
        res,
        { conversation: conv, messages },
        'Messages récupérés',
      );
    } catch (e) {
      next(e);
    }
  }

  static async envoyer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres'],
      });

      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      const { contenu, type, fichierUrl, fichierNom, fichierTaille } = req.body;

      if (!contenu && !fichierUrl) {
        throw new BadRequestError('Message vide (contenu ou fichier requis)');
      }

      const msgRepo = AppDataSource.getRepository(Message);

      const msg = msgRepo.create({
        conversationId: conv.id,
        expediteurId: userId,
        contenu: contenu?.trim() ?? null,
        type: (type as TypeMessage) || TypeMessage.TEXTE,
        fichierUrl,
        fichierNom,
        fichierTaille,
      });

      await msgRepo.save(msg);

      // Mettre à jour la date du dernier message
      conv.dernierMessageAt = new Date();
      await AppDataSource.getRepository(Conversation).save(conv);

      return successResponse(res, msg, 'Message envoyé', 201);
    } catch (e) {
      next(e);
    }
  }

  static async marquerLus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const conv = await AppDataSource.getRepository(Conversation).findOne({
        where: { id: req.params.id },
        relations: ['membres'],
      });

      if (!conv) throw new NotFoundError('Conversation introuvable');
      if (!conv.membres.some((m) => m.id === userId)) {
        throw new ForbiddenError('Accès refusé');
      }

      // ⭐ Utilise les propriétés TS : conversationId, expediteurId, lu, dateLecture
      await AppDataSource.getRepository(Message)
        .createQueryBuilder()
        .update(Message)
        .set({ lu: true, dateLecture: new Date() })
        .where('conversationId = :cid', { cid: req.params.id }) // ⭐ conversationId
        .andWhere('expediteurId != :uid', { uid: userId }) // ⭐ expediteurId
        .andWhere('lu = :isLue', { isLue: false }) // ⭐ lu = :isLue
        .execute();

      return successResponse(res, null, 'Messages marqués comme lus');
    } catch (e) {
      next(e);
    }
  }

  static async supprimerMessage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      const repo = AppDataSource.getRepository(Message);

      const msg = await repo.findOne({
        where: { id: req.params.id },
        relations: ['conversation', 'conversation.membres'],
      });

      if (!msg) throw new NotFoundError('Message introuvable');

      if (msg.expediteurId !== userId) {
        throw new ForbiddenError(
          'Vous ne pouvez supprimer que vos propres messages',
        );
      }

      await repo.softDelete(req.params.id);

      logger.info(`🗑️ Message supprimé : ${req.params.id}`);

      return successResponse(res, null, 'Message supprimé');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     🔔 COMPTEURS
     ========================================================================== */

  static async countNonLus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);

      // ⭐ Utilise les propriétés TS partout
      const count = await AppDataSource.getRepository(Message)
        .createQueryBuilder('m')
        .leftJoin('m.conversation', 'c')
        .leftJoin('c.membres', 'u')
        .where('u.id = :uid', { uid: userId })
        .andWhere('m.expediteurId != :uid', { uid: userId }) // ⭐ expediteurId
        .andWhere('m.lu = :isLue', { isLue: false }) // ⭐ lu
        .getCount();

      return successResponse(res, { count }, 'Messages non lus');
    } catch (e) {
      next(e);
    }
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}