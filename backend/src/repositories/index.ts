// src/repositories/index.ts
/**
 * =============================================================================
 * 📦 EXPORT CENTRALISÉ DES REPOSITORIES
 * =============================================================================
 * Instances uniques (singleton) pour éviter les re-créations.
 * ⚠️ Ne jamais faire `new XxxRepository()` ailleurs : toujours passer par ici.
 * =============================================================================
 */

// =============================================================================
// 📥 IMPORTS
// =============================================================================
import { UserRepository }         from './user.repository';
import { RoleRepository }         from './RoleRepository';
import { DomaineRepository }      from './DomaineRepository';
import { FormationRepository }    from './formation.repository';
import { SessionRepository }      from './session.repository';
import { InscriptionRepository }  from './inscription.repository';
import { PresenceRepository }     from './presence.repository';
import { EvaluationRepository }   from './EvaluationRepository';
import { NoteRepository }         from './note.repository';
import { AttestationRepository }  from './attestation.repository';
import { RessourceRepository }    from './RessourceRepository';
import { PartenaireRepository }   from './PartenaireRepository';
import { ConnectionRepository }   from './ConnectionRepository';
import { ConversationRepository } from './ConversationRepository';
import { MessageRepository }      from './message.repository';
import { NotificationRepository } from './notification.repository';
import { AuditLogRepository }     from './AuditLogRepository';

// =============================================================================
// 🎯 INSTANCES UNIQUES (singletons)
// =============================================================================

/** 👥 Utilisateurs (tous rôles) */
export const userRepository         = new UserRepository();

/** 🎭 Rôles (Administrateur, Staff ODC, Formateur, Participant, Partenaire) */
export const roleRepository         = new RoleRepository();

/** 🏷️ Domaines de formation */
export const domaineRepository      = new DomaineRepository();

/** 📚 Catalogue des formations */
export const formationRepository    = new FormationRepository();

/** 📅 Sessions de formation */
export const sessionRepository      = new SessionRepository();

/** 📝 Inscriptions aux sessions */
export const inscriptionRepository  = new InscriptionRepository();

/** ✅ Présences (QR code + manuel) */
export const presenceRepository     = new PresenceRepository();

/** 📊 Évaluations */
export const evaluationRepository   = new EvaluationRepository();

/** 🖊️ Notes d'évaluation */
export const noteRepository         = new NoteRepository();

/** 🎓 Attestations */
export const attestationRepository  = new AttestationRepository();

/** 📎 Ressources pédagogiques */
export const ressourceRepository    = new RessourceRepository();

/** 🤝 Partenaires ODC */
export const partenaireRepository   = new PartenaireRepository();

/** 👥 Connexions (réseautage) */
export const connectionRepository   = new ConnectionRepository();

/** 💬 Conversations (messagerie) */
export const conversationRepository = new ConversationRepository();

/** ✉️ Messages */
export const messageRepository      = new MessageRepository();

/** 🔔 Notifications */
export const notificationRepository = new NotificationRepository();

/** 📜 Journal d'audit */
export const auditLogRepository     = new AuditLogRepository();

// =============================================================================
// 📤 RÉ-EXPORTS DES CLASSES
// =============================================================================
export {
  UserRepository,
  RoleRepository,
  DomaineRepository,
  FormationRepository,
  SessionRepository,
  InscriptionRepository,
  PresenceRepository,
  EvaluationRepository,
  NoteRepository,
  AttestationRepository,
  RessourceRepository,
  PartenaireRepository,
  ConnectionRepository,
  ConversationRepository,
  MessageRepository,
  NotificationRepository,
  AuditLogRepository,
};

// =============================================================================
// 📤 RÉ-EXPORTS DE LA BASE
// =============================================================================
export { BaseRepository } from './base.repository';
export type {
  PaginationOptions,
  PaginatedResult,
} from './base.repository';