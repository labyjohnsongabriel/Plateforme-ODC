import { Namespace, Socket } from 'socket.io';
import { logger } from '../config/logger';
import { AppDataSource } from '../config/database';
import { Notification } from '../models/Notification.entity';
import { NotificationService } from '../services/notification.service';

/**
 * Configuration
 */
const NOTIF_CONFIG = {
  maxPerBatch: 20,
  refreshInterval: 30000, // 30s
};

/**
 * Setup du namespace /notifications
 */
export function setupNotificationSocket(notifNs: Namespace): void {
  notifNs.on('connection', async (socket: Socket) => {
    const userId: string = socket.data.userId;
    const userName: string = socket.data.userName;

    logger.info(`🔔 [NOTIF] Connexion user=${userId} (${userName})`);

    // Rejoindre la room personnelle
    socket.join(`user:${userId}`);

    // Rejoindre la room du rôle
    if (socket.data.userRole) {
      socket.join(`role:${socket.data.userRole}`);
    }

    // ==================================================
    // ENVOYER LE COMPTE INITIAL
    // ==================================================
    try {
      const count = await NotificationService.countNonLues(userId);
      socket.emit('notifications:count', { count });
    } catch (err) {
      logger.error('Erreur comptage notifications :', err);
    }

    // ==================================================
    // DEMANDER LES NOTIFICATIONS RÉCENTES
    // ==================================================
    socket.on('notifications:fetch', async (data?: { limit?: number; page?: number }) => {
      try {
        const limit = Math.min(data?.limit || 20, 100);
        const page = Math.max(data?.page || 1, 1);

        const result = await NotificationService.mesNotifications(userId, { page, limit });

        socket.emit('notifications:list', {
          data: result.data,
          total: result.total,
          page,
          limit,
          nonLues: result.nonLues,
        });
      } catch (err: any) {
        socket.emit('error', {
          type: 'FETCH_ERROR',
          message: err.message,
        });
      }
    });

    // ==================================================
    // MARQUER UNE NOTIFICATION COMME LUE
    // ==================================================
    socket.on('notification:read', async (notificationId: string) => {
      try {
        await NotificationService.marquerLue(userId, notificationId);

        // Diffuser le nouveau compteur
        const count = await NotificationService.countNonLues(userId);
        socket.emit('notifications:count', { count });

        socket.emit('notification:read:confirmed', { notificationId });
      } catch (err: any) {
        socket.emit('error', {
          type: 'READ_ERROR',
          message: err.message,
        });
      }
    });

    // ==================================================
    // MARQUER TOUTES COMME LUES
    // ==================================================
    socket.on('notifications:read-all', async () => {
      try {
        await NotificationService.marquerToutesLues(userId);
        socket.emit('notifications:count', { count: 0 });
        socket.emit('notifications:read-all:confirmed');
      } catch (err: any) {
        socket.emit('error', {
          type: 'READ_ALL_ERROR',
          message: err.message,
        });
      }
    });

    // ==================================================
    // SUPPRIMER UNE NOTIFICATION
    // ==================================================
    socket.on('notification:delete', async (notificationId: string) => {
      try {
        const repo = AppDataSource.getRepository(Notification);
        const notif = await repo.findOne({
          where: { id: notificationId, userId },
        });

        if (!notif) {
          socket.emit('error', {
            type: 'NOT_FOUND',
            message: 'Notification introuvable',
          });
          return;
        }

        await repo.softDelete(notificationId);
        socket.emit('notification:deleted', { notificationId });

        const count = await NotificationService.countNonLues(userId);
        socket.emit('notifications:count', { count });
      } catch (err: any) {
        socket.emit('error', {
          type: 'DELETE_ERROR',
          message: err.message,
        });
      }
    });

    // ==================================================
    // RAFRAÎCHIR LE COMPTEUR (polling fallback)
    // ==================================================
    socket.on('notifications:refresh', async () => {
      try {
        const count = await NotificationService.countNonLues(userId);
        socket.emit('notifications:count', { count });
      } catch (err: any) {
        socket.emit('error', {
          type: 'REFRESH_ERROR',
          message: err.message,
        });
      }
    });

    // ==================================================
    // SUBSCRIBE À UN CANAL (admin)
    // ==================================================
    socket.on('admin:subscribe', (channel: string) => {
      if (socket.data.userRole !== 'ADMIN') {
        socket.emit('error', {
          type: 'FORBIDDEN',
          message: 'Réservé aux administrateurs',
        });
        return;
      }

      socket.join(`admin:${channel}`);
      logger.info(`👑 [NOTIF] Admin ${userId} abonné à admin:${channel}`);
    });

    socket.on('admin:unsubscribe', (channel: string) => {
      socket.leave(`admin:${channel}`);
    });

    // ==================================================
    // DÉCONNEXION
    // ==================================================
    socket.on('disconnect', () => {
      logger.info(`❌ [NOTIF] Déconnexion user=${userId}`);
    });
  });
}

// ==================================================
// HELPERS PUBLICS
// ==================================================

/**
 * Émet une notification temps réel à un utilisateur
 */
export function emitNotification(
  notifNs: Namespace,
  userId: string,
  notification: any
): void {
  notifNs.to(`user:${userId}`).emit('notification:new', notification);

  // Mettre à jour le compteur
  NotificationService.countNonLues(userId)
    .then((count) => {
      notifNs.to(`user:${userId}`).emit('notifications:count', { count });
    })
    .catch(() => {});
}

/**
 * Émet une notification à tous les utilisateurs d'un rôle
 */
export function emitNotificationToRole(
  notifNs: Namespace,
  role: string,
  notification: any
): void {
  notifNs.to(`role:${role}`).emit('notification:new', notification);
}

/**
 * Émet une notification à tous les admins
 */
export function emitAdminNotification(
  notifNs: Namespace,
  channel: string,
  data: any
): void {
  notifNs.to(`admin:${channel}`).emit('admin:notification', data);
}