/**
 * Export centralisé des repositories
 * Instances uniques (singleton) pour éviter les re-créations
 */
import { UserRepository } from './UserRepository';
import { FormationRepository } from './FormationRepository';
import { SessionRepository } from './SessionRepository';
import { InscriptionRepository } from './InscriptionRepository';
import { PresenceRepository } from './PresenceRepository';
import { AttestationRepository } from './AttestationRepository';
import { NotificationRepository } from './NotificationRepository';
import { ConversationRepository, MessageRepository } from './ConversationRepository';

export const userRepository = new UserRepository();
export const formationRepository = new FormationRepository();
export const sessionRepository = new SessionRepository();
export const inscriptionRepository = new InscriptionRepository();
export const presenceRepository = new PresenceRepository();
export const attestationRepository = new AttestationRepository();
export const notificationRepository = new NotificationRepository();
export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();

export {
  UserRepository,
  FormationRepository,
  SessionRepository,
  InscriptionRepository,
  PresenceRepository,
  AttestationRepository,
  NotificationRepository,
  ConversationRepository,
  MessageRepository,
};