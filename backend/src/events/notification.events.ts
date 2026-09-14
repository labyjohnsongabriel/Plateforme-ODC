import { eventEmitter, EVENTS } from './index';
import { logger } from '../config/logger';
import { getIo } from '../sockets';

/**
 * Enregistre les écouteurs d'événements liés aux notifications
 */
export function registerNotificationEvents(): void {
  /**
   * Notification créée → push WebSocket
   */
  eventEmitter.on(
    EVENTS.NOTIFICATION_CREATED,
    (data: { notification: any; userId: string }) => {
      try {
        const io = getIo();
        io.of('/chat').to(`user:${data.userId}`).emit('notification:new', data.notification);
        logger.debug(`📡 Notification push à user:${data.userId}`);
      } catch (err) {
        // Socket non initialisé
      }
    }
  );

  /**
   * Notification lue
   */
  eventEmitter.on(
    EVENTS.NOTIFICATION_READ,
    (data: { notificationId: string; userId: string }) => {
      logger.debug(`📖 Notification lue : ${data.notificationId}`);
    }
  );

  /**
   * Utilisateur connecté
   */
  eventEmitter.on(
    EVENTS.USER_LOGGED_IN,
    (data: { userId: string; email: string }) => {
      logger.info(`🔐 Connexion : ${data.email}`);
    }
  );

  /**
   * Utilisateur créé
   */
  eventEmitter.on(
    EVENTS.USER_CREATED,
    (data: { userId: string; email: string }) => {
      logger.info(`👤 Nouvel utilisateur : ${data.email}`);
    }
  );

  /**
   * Session démarrée
   */
  eventEmitter.on(
    EVENTS.SESSION_STARTED,
    (data: { sessionId: string }) => {
      logger.info(`▶️  Session démarrée : ${data.sessionId}`);
    }
  );

  /**
   * Session terminée
   */
  eventEmitter.on(
    EVENTS.SESSION_ENDED,
    (data: { sessionId: string }) => {
      logger.info(`⏹️  Session terminée : ${data.sessionId}`);
    }
  );

  /**
   * Présence marquée
   */
  eventEmitter.on(
    EVENTS.PRESENCE_MARKED,
    (data: { sessionId: string; participantId: string; present: boolean }) => {
      logger.debug(
        `📍 Présence : session=${data.sessionId} participant=${data.participantId} → ${data.present ? 'présent' : 'absent'}`
      );
    }
  );

  logger.info('✅ Events notification enregistrés');
}