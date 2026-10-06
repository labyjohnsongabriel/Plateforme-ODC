import { Namespace, Socket } from 'socket.io';
import { logger } from '../config/logger';
import { MessagerieService } from '../services/messagerie.service';
import { NotificationService } from '../services/notification.service';
import { TypeNotification } from '../entities/Notification.entity';
import { AppDataSource } from '../config/database';
import { Conversation } from '../entities/Conversation.entity';

/**
 * Utilisateurs en train d'écrire : Map<conversationId, Map<userId, timeout>>
 */
const typingUsers = new Map<string, Map<string, NodeJS.Timeout>>();

/**
 * Configuration de la messagerie
 */
const MESSAGERIE_CONFIG = {
  typingTimeout: 3000, // 3 secondes
  maxMessageLength: 5000,
  maxFileSize: 10 * 1024 * 1024, // 10 MB
};

/**
 * Setup du namespace /chat
 */
export function setupMessagerieSocket(chatNs: Namespace): void {
  chatNs.on('connection', (socket: Socket) => {
    const userId: string = socket.data.userId;
    const userName: string = socket.data.userName;

    logger.info(`💬 [CHAT] Connexion user=${userId} (${userName})`);

    // Rejoindre la room personnelle
    socket.join(`user:${userId}`);

    // ==================================================
    // REJOINDRE UNE CONVERSATION
    // ==================================================
    socket.on('conversation:join', async (conversationId: string) => {
      try {
        const isMembre = await MessagerieService.isMembre(conversationId, userId);
        if (!isMembre) {
          socket.emit('error', {
            type: 'FORBIDDEN',
            message: 'Vous n\'êtes pas membre de cette conversation',
          });
          return;
        }

        socket.join(`conv:${conversationId}`);

        logger.info(
          `👥 [CHAT] user=${userId} a rejoint conv=${conversationId}`
        );

        // Notifier les autres membres
        socket.to(`conv:${conversationId}`).emit('conversation:userJoined', {
          conversationId,
          userId,
          userName,
          timestamp: new Date().toISOString(),
        });

        // Envoyer l'état actuel (qui est en ligne)
        const membres = await getConversationMembers(conversationId);
        const onlineIds = Array.from(chatNs.adapter.rooms.get(`conv:${conversationId}`) || [])
          .map((sid) => chatNs.sockets.get(sid)?.data?.userId)
          .filter(Boolean);

        socket.emit('conversation:state', {
          conversationId,
          membres,
          onlineIds: [...new Set(onlineIds)],
        });
      } catch (err: any) {
        logger.error(`❌ [CHAT] Erreur join conv=${conversationId} :`, err);
        socket.emit('error', {
          type: 'SERVER_ERROR',
          message: err.message || 'Impossible de rejoindre la conversation',
        });
      }
    });

    // ==================================================
    // QUITTER UNE CONVERSATION
    // ==================================================
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);

      // Nettoyer l'indicateur typing
      clearTyping(conversationId, userId);

      socket.to(`conv:${conversationId}`).emit('conversation:userLeft', {
        conversationId,
        userId,
        timestamp: new Date().toISOString(),
      });

      logger.debug(`🚪 [CHAT] user=${userId} a quitté conv=${conversationId}`);
    });

    // ==================================================
    // ENVOYER UN MESSAGE
    // ==================================================
    socket.on(
      'message:send',
      async (data: {
        conversationId: string;
        contenu: string;
        fichierUrl?: string;
        fichierNom?: string;
        fichierTaille?: number;
        type?: string;
      }) => {
        const startTime = Date.now();

        try {
          // Validation
          if (!data.conversationId || !data.contenu?.trim()) {
            socket.emit('error', {
              type: 'VALIDATION_ERROR',
              message: 'conversationId et contenu sont requis',
            });
            return;
          }

          if (data.contenu.length > MESSAGERIE_CONFIG.maxMessageLength) {
            socket.emit('error', {
              type: 'VALIDATION_ERROR',
              message: `Message trop long (max ${MESSAGERIE_CONFIG.maxMessageLength} caractères)`,
            });
            return;
          }

          // Enregistrer le message en BDD
          const message = await MessagerieService.envoyerMessage(
            data.conversationId,
            userId,
            data.contenu.trim(),
            data.fichierUrl
          );

          // Diffuser à tous les membres de la conversation
          chatNs.to(`conv:${data.conversationId}`).emit('message:new', {
            ...message,
            conversationId: data.conversationId,
            fichierNom: data.fichierNom,
            fichierTaille: data.fichierTaille,
          });

          // Effacer indicateur typing
          clearTyping(data.conversationId, userId);

          // Envoyer notifications aux autres membres (déconnectés ou non)
          await notifierAutresMembres(
            data.conversationId,
            userId,
            message.contenu.substring(0, 100)
          );

          logger.info(
            `📨 [CHAT] Message envoyé conv=${data.conversationId} user=${userId} en ${Date.now() - startTime}ms`
          );
        } catch (err: any) {
          logger.error(`❌ [CHAT] Erreur envoi message :`, err);
          socket.emit('error', {
            type: 'SEND_ERROR',
            message: err.message || 'Impossible d\'envoyer le message',
          });
        }
      }
    );

    // ==================================================
    // MARQUER COMME LU
    // ==================================================
    socket.on('message:read', async (conversationId: string) => {
      try {
        await MessagerieService.marquerLus(conversationId, userId);

        // Notifier les autres membres
        chatNs.to(`conv:${conversationId}`).emit('message:read:confirmed', {
          conversationId,
          userId,
          timestamp: new Date().toISOString(),
        });

        logger.debug(
          `✅ [CHAT] Messages lus conv=${conversationId} par user=${userId}`
        );
      } catch (err: any) {
        socket.emit('error', {
          type: 'READ_ERROR',
          message: err.message,
        });
      }
    });

    // ==================================================
    // INDICATEUR DE SAISIE (TYPING)
    // ==================================================
    socket.on('typing:start', (conversationId: string) => {
      if (!conversationId) return;

      // Diffuser aux autres membres
      socket.to(`conv:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
        userName,
      });

      // Ajouter au tracking
      addTyping(conversationId, userId);

      // Auto-clear après timeout
      const timeout = setTimeout(() => {
        clearTyping(conversationId, userId);
        socket.to(`conv:${conversationId}`).emit('typing:stop', {
          conversationId,
          userId,
        });
      }, MESSAGERIE_CONFIG.typingTimeout);

      // Nettoyer le timeout précédent
      const convTyping = typingUsers.get(conversationId);
      if (convTyping?.has(userId)) {
        clearTimeout(convTyping.get(userId)!);
      }
      addTyping(conversationId, userId, timeout);
    });

    socket.on('typing:stop', (conversationId: string) => {
      if (!conversationId) return;

      clearTyping(conversationId, userId);

      socket.to(`conv:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    // ==================================================
    // SUPPRIMER UN MESSAGE
    // ==================================================
    socket.on('message:delete', async (messageId: string) => {
      try {
        const message = await AppDataSource.getRepository(Message).findOne({
          where: { id: messageId },
        });

        if (!message) {
          socket.emit('error', { type: 'NOT_FOUND', message: 'Message introuvable' });
          return;
        }

        // Seul l'expéditeur peut supprimer
        if (message.expediteurId !== userId) {
          socket.emit('error', {
            type: 'FORBIDDEN',
            message: 'Vous ne pouvez supprimer que vos propres messages',
          });
          return;
        }

        await AppDataSource.getRepository(Message).softDelete(messageId);

        chatNs.to(`conv:${message.conversationId}`).emit('message:deleted', {
          messageId,
          conversationId: message.conversationId,
          userId,
        });

        logger.info(`🗑️  [CHAT] Message supprimé : ${messageId}`);
      } catch (err: any) {
        socket.emit('error', {
          type: 'DELETE_ERROR',
          message: err.message,
        });
      }
    });

    // ==================================================
    // DÉCONNEXION
    // ==================================================
    socket.on('disconnect', () => {
      // Nettoyer tous les typing indicators de cet utilisateur
      for (const [conversationId, convTyping] of typingUsers.entries()) {
        if (convTyping.has(userId)) {
          clearTyping(conversationId, userId);
          chatNs.to(`conv:${conversationId}`).emit('typing:stop', {
            conversationId,
            userId,
          });
        }
      }

      logger.info(`❌ [CHAT] Déconnexion user=${userId}`);
    });
  });
}

// ==================================================
// HELPERS
// ==================================================

/**
 * Ajoute un utilisateur en train d'écrire
 */
function addTyping(
  conversationId: string,
  userId: string,
  timeout?: NodeJS.Timeout
): void {
  if (!typingUsers.has(conversationId)) {
    typingUsers.set(conversationId, new Map());
  }
  if (timeout) {
    typingUsers.get(conversationId)!.set(userId, timeout);
  }
}

/**
 * Supprime l'indicateur typing
 */
function clearTyping(conversationId: string, userId: string): void {
  const convTyping = typingUsers.get(conversationId);
  if (convTyping?.has(userId)) {
    clearTimeout(convTyping.get(userId)!);
    convTyping.delete(userId);

    if (convTyping.size === 0) {
      typingUsers.delete(conversationId);
    }
  }
}

/**
 * Récupère les membres d'une conversation
 */
async function getConversationMembers(conversationId: string): Promise<any[]> {
  try {
    const conv = await AppDataSource.getRepository(Conversation).findOne({
      where: { id: conversationId },
      relations: ['membres', 'membres.role'],
    });

    return (
      conv?.membres.map((m) => ({
        id: m.id,
        nom: m.nom,
        prenom: m.prenom,
        photoUrl: m.photoUrl,
        role: m.role?.nom,
      })) || []
    );
  } catch {
    return [];
  }
}

/**
 * Notifie les autres membres d'un nouveau message
 */
async function notifierAutresMembres(
  conversationId: string,
  expediteurId: string,
  preview: string
): Promise<void> {
  try {
    const conv = await AppDataSource.getRepository(Conversation).findOne({
      where: { id: conversationId },
      relations: ['membres'],
    });

    if (!conv) return;

    const destinataires = conv.membres.filter((m) => m.id !== expediteurId);

    for (const dest of destinataires) {
      await NotificationService.create({
        userId: dest.id,
        titre: conv.titre || 'Nouveau message',
        message: preview.substring(0, 80) + (preview.length > 80 ? '...' : ''),
        type: TypeNotification.INFO,
        metadata: { conversationId, expediteurId },
      });
    }
  } catch (err) {
    logger.error('Erreur notification message :', err);
  }
}

// Import manquant
import { Message } from '../entities/Message.entity';