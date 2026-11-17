// src/controllers/messagerie.controller.ts
import { Request, Response, NextFunction } from 'express';
import { MessagerieService } from '../services/messagerie.service';
import { successResponse, paginatedResponse } from '../utils/response.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { emitToConversation } from '../sockets';

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
  static async chercherUtilisateurs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const users = await MessagerieService.chercherUtilisateurs(
        getUserId(req),
        typeof req.query.q === 'string' ? req.query.q : '',
      );
      successResponse(res, users);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/messagerie/conversations
     ⭐ Liste des conversations de l'utilisateur connecté
     ========================================================================== */
  static async mesConversations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const conversations = await MessagerieService.mesConversations(userId);
      successResponse(res, conversations);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/messagerie/conversations/privee
     Créer une conversation privée
     ========================================================================== */
  static async createPrivate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { destinataireId } = req.body;

      if (!destinataireId) {
        throw new BadRequestError('destinataireId est requis');
      }

      const conversation = await MessagerieService.createPrivate(
        userId,
        destinataireId,
      );

      successResponse(res, conversation, 'Conversation créée', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/messagerie/conversations/groupe
     Créer une conversation de groupe
     ========================================================================== */
  static async createGroupe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { titre, membreIds, photoUrl } = req.body;

      if (!titre || !Array.isArray(membreIds) || membreIds.length === 0) {
        throw new BadRequestError('titre et membreIds sont requis');
      }

      const conversation = await MessagerieService.createGroupe(
        userId,
        titre,
        membreIds,
        photoUrl,
      );

      successResponse(res, conversation, 'Groupe créé', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/messagerie/conversations/:id
     Détail d'une conversation
     ========================================================================== */
  static async getConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const conversation = await MessagerieService.getConversation(
        req.params.id,
        userId,
      );

      if (!conversation) {
        throw new NotFoundError('Conversation introuvable');
      }

      successResponse(res, conversation);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/messagerie/conversations/:id/messages
     Liste des messages
     ========================================================================== */
  static async getMessages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
      const conversation = await MessagerieService.getConversation(
        req.params.id,
        userId,
      );

      const messages = await MessagerieService.getMessages(
        req.params.id,
        userId,
        limit,
      );

      successResponse(res, { conversation, messages });
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     POST /api/messagerie/conversations/:id/messages
     Envoyer un message
     ========================================================================== */
  static async envoyer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const { contenu, type, fichierUrl, fichierNom, fichierTaille } =
        req.body;

      if (!contenu && !fichierUrl) {
        throw new BadRequestError(
          'Le message doit contenir du texte ou un fichier',
        );
      }

      const message = await MessagerieService.envoyer(
        req.params.id,
        userId,
        {
          contenu,
          type,
          fichierUrl,
          fichierNom,
          fichierTaille,
        },
      );

      emitToConversation(req.params.id, 'message:new', message);
      successResponse(res, message, 'Message envoyé', 201);
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     PUT /api/messagerie/conversations/:id/lu
     Marquer tous les messages comme lus
     ========================================================================== */
  static async marquerLus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const result = await MessagerieService.marquerLus(
        req.params.id,
        userId,
      );
      successResponse(res, result, 'Messages marqués comme lus');
    } catch (e) {
      next(e);
    }
  }

  /* ==========================================================================
     GET /api/messagerie/non-lus
     Compter les messages non lus
     ========================================================================== */
  static async countNonLus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = getUserId(req);
      const result = await MessagerieService.countNonLus(userId);
      successResponse(res, result);
    } catch (e) {
      next(e);
    }
  }
}