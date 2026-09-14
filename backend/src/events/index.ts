import { EventEmitter } from 'events';
import { logger } from '../config/logger';

/**
 * Émetteur d'événements global
 */
export const eventEmitter = new EventEmitter();

// Augmenter le nombre max d'écouteurs
eventEmitter.setMaxListeners(50);

// Log de tous les événements (dev)
if (process.env.NODE_ENV === 'development') {
  const originalEmit = eventEmitter.emit.bind(eventEmitter);
  eventEmitter.emit = (event: string | symbol, ...args: any[]) => {
    logger.debug(`📡 Event: ${String(event)}`);
    return originalEmit(event, ...args);
  };
}

/**
 * Noms des événements
 */
export const EVENTS = {
  // Attestations
  ATTESTATION_GENERATED: 'attestation.generated',
  ATTESTATION_DOWNLOADED: 'attestation.downloaded',
  ATTESTATION_VERIFIED: 'attestation.verified',

  // Inscriptions
  INSCRIPTION_CREATED: 'inscription.created',
  INSCRIPTION_ACCEPTED: 'inscription.accepted',
  INSCRIPTION_REFUSED: 'inscription.refused',
  INSCRIPTION_CANCELLED: 'inscription.cancelled',

  // Notifications
  NOTIFICATION_CREATED: 'notification.created',
  NOTIFICATION_READ: 'notification.read',

  // Sessions
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended',

  // Présences
  PRESENCE_MARKED: 'presence.marked',

  // Users
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGGED_IN: 'user.loggedIn',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];