// src/services/inscription.service.ts
import { inscriptionRepository } from '../repositories/inscription.repository';
import { sessionRepository } from '../repositories/session.repository';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/RoleRepository';
import { notificationService } from './notification.service';
import { StatutInscription, RoleName } from '../entities/enums';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/* ============================================================================
   MESSAGES CONTEXTUELS PAR STATUT
   ============================================================================ */

const STATUT_MESSAGES: Record<
  StatutInscription,
  { user: string; toast: 'info' | 'warning' | 'success' | 'error' }
> = {
  [StatutInscription.EN_ATTENTE]: {
    user:
      'Votre inscription est déjà enregistrée et en attente de validation. Vous recevrez une notification dès qu\'elle sera traitée.',
    toast: 'info',
  },
  [StatutInscription.ACCEPTEE]: {
    user:
      'Vous êtes déjà inscrit et accepté pour cette session. Consultez votre espace participant pour plus de détails.',
    toast: 'success',
  },
  [StatutInscription.REFUSEE]: {
    user:
      'Votre précédente inscription a été refusée. Contactez le staff ODC pour plus d\'informations.',
    toast: 'error',
  },
  [StatutInscription.LISTE_ATTENTE]: {
    user:
      'Vous êtes déjà en liste d\'attente pour cette session. Vous serez notifié dès qu\'une place se libère.',
    toast: 'warning',
  },
  [StatutInscription.ANNULEE]: {
    user: 'Votre inscription avait été annulée. Vous pouvez la réactiver.',
    toast: 'info',
  },
};

/* ============================================================================
   SERVICE
   ============================================================================ */

export class InscriptionService {
  /* ==========================================================================
     🔒 PARTICIPANT AUTHENTIFIÉ — S'inscrire
     ========================================================================== */
  static async create(
    userId: string,
    sessionId: string,
    motivation?: string,
  ) {
    /* -------------------- 1. Vérifier la session -------------------- */
    const session = await sessionRepository.findById(sessionId, ['formation']);

    if (!session) {
      throw new NotFoundError('Session introuvable');
    }

    if (!session.estPubliee) {
      throw new ForbiddenError(
        'Cette session n\'est pas ouverte au public',
      );
    }

    /* -------------------- 2. Vérifier la date de fermeture -------------------- */
    if (
      session.dateFermetureInscriptions &&
      session.dateFermetureInscriptions < new Date()
    ) {
      throw new ForbiddenError(
        'Les inscriptions sont fermées pour cette session',
      );
    }

    if (session.statut !== 'OUVERTE') {
      throw new ForbiddenError(
        `Les inscriptions ne sont pas ouvertes (statut : ${session.statut})`,
      );
    }

    /* -------------------- 3. ⭐ Vérifier les doublons par statut -------------------- */
    const existing = await inscriptionRepository.findBySessionAndParticipant(
      sessionId,
      userId,
    );

    if (existing) {
      const statut = existing.statut as StatutInscription;

      // ✅ RÉACTIVATION pour une inscription annulée
      if (statut === StatutInscription.ANNULEE) {
        existing.statut = StatutInscription.EN_ATTENTE;
        existing.motifRefus = null as any;
        existing.dateAnnulation = null as any;
        existing.motivation = motivation ?? existing.motivation;
        await inscriptionRepository.save(existing);

        await notificationService.create({
          userId,
          titre: '🔄 Inscription réactivée',
          message: `Votre inscription à « ${session.formation.titre} » a été réactivée et est en attente de validation.`,
          metadata: {
            inscriptionId: existing.id,
            sessionId,
          },
        });

        logger.info(
          `🔄 Inscription réactivée : user=${userId} session=${session.codeSession}`,
        );

        return {
          inscription: existing,
          message:
            'Votre inscription a été réactivée avec succès. Elle est en attente de validation.',
          reactivated: true,
        };
      }

      // ❌ Sinon → Conflit avec message contextuel
      const msg = STATUT_MESSAGES[statut] ?? {
        user: 'Vous êtes déjà inscrit à cette session.',
        toast: 'info' as const,
      };

      throw new ConflictError(msg.user);
    }

    /* -------------------- 4. Déterminer le statut selon la capacité -------------------- */
    const acceptedCount = await inscriptionRepository.countAcceptees(sessionId);

    const statut =
      acceptedCount >= session.capacite
        ? StatutInscription.LISTE_ATTENTE
        : StatutInscription.EN_ATTENTE;

    /* -------------------- 5. Créer l'inscription -------------------- */
    const inscription = await inscriptionRepository.create({
      sessionId,
      participantId: userId,
      motivation,
      statut,
    });

    /* -------------------- 6. Notification -------------------- */
    await notificationService.create({
      userId,
      titre:
        statut === StatutInscription.LISTE_ATTENTE
          ? '⏳ Liste d\'attente'
          : '📩 Inscription enregistrée',
      message:
        statut === StatutInscription.LISTE_ATTENTE
          ? `Vous êtes en liste d'attente pour « ${session.formation.titre} ». Vous serez notifié dès qu'une place se libère.`
          : `Votre inscription à « ${session.formation.titre} » a été enregistrée. Elle sera validée par le staff ODC.`,
      metadata: {
        inscriptionId: inscription.id,
        sessionId,
      },
    });

    logger.info(
      `📝 Inscription créée : user=${userId} session=${session.codeSession} statut=${statut}`,
    );

    return {
      inscription,
      message:
        statut === StatutInscription.LISTE_ATTENTE
          ? 'Vous êtes en liste d\'attente. Vous serez notifié dès qu\'une place se libère.'
          : 'Votre inscription a été enregistrée. Elle sera validée par le staff.',
      reactivated: false,
    };
  }

  /* ==========================================================================
     🌐 PUBLIC — Inscription sans compte
     ========================================================================== */
  static async createPublic(data: {
    sessionId: string;
    email: string;
    nom: string;
    prenom: string;
    motivation?: string;
    telephone?: string;
  }) {
    /* -------------------- 1. Vérifier la session -------------------- */
    const session = await sessionRepository.findById(data.sessionId, [
      'formation',
    ]);

    if (!session) {
      throw new NotFoundError('Session introuvable');
    }

    if (!session.estPubliee) {
      throw new ForbiddenError('Cette session n\'est pas ouverte au public');
    }

    /* -------------------- 2. Chercher ou créer l'utilisateur -------------------- */
    let user = await userRepository.findByEmail(data.email.toLowerCase());

    if (!user) {
      const role = await roleRepository.findByName(RoleName.PARTICIPANT);
      if (!role) {
        throw new NotFoundError('Rôle PARTICIPANT non initialisé');
      }

      const tempPassword = crypto.randomBytes(8).toString('hex');
      user = await userRepository.create({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email.toLowerCase(),
        telephone: data.telephone,
        motDePasse: await bcrypt.hash(tempPassword, 12),
        roleId: role.id,
      });

      logger.info(`👤 Compte créé via inscription publique : ${user.email}`);

      // TODO: envoyer email de bienvenue avec mot de passe temporaire
    }

    /* -------------------- 3. Déléguer à create() -------------------- */
    return this.create(user.id, data.sessionId, data.motivation);
  }

  /* ==========================================================================
     📋 LISTE
     ========================================================================== */
  static async findAll(userId: string, userRole: RoleName, filters: any) {
    const isStaffOrAdmin = [
      RoleName.ADMINISTRATEUR,
      RoleName.STAFF_ODC,
    ].includes(userRole);

    if (isStaffOrAdmin) {
      const sessionId = filters.sessionId as string;
      const data = sessionId
        ? await inscriptionRepository.findBySession(sessionId)
        : await inscriptionRepository.findMany();

      const page = Number(filters.page) || 1;
      const limit = Number(filters.limit) || 10;
      const total = data.length;

      return {
        data: data.slice((page - 1) * limit, page * limit),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Participant : uniquement ses inscriptions
    const data = await inscriptionRepository.findByParticipant(userId);
    return {
      data,
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
    };
  }

  /* ==========================================================================
     🔍 DÉTAIL
     ========================================================================== */
  static async findById(id: string) {
    return inscriptionRepository.findByIdOrFail(id, [
      'session',
      'participant',
    ]);
  }

  /* ==========================================================================
     ✅ SÉLECTIONNER (STAFF)
     ========================================================================== */
  static async selectionner(
    id: string,
    statut: StatutInscription,
    motifRefus: string | undefined,
    staffId: string,
  ) {
    const inscription = await inscriptionRepository.findByIdOrFail(id, [
      'session',
      'session.formation',
    ]);

    /* -------------------- Mise à jour -------------------- */
    inscription.statut = statut;
    inscription.motifRefus = (motifRefus ?? null) as any;
    inscription.dateSelection = new Date();
    inscription.selectionnePar = staffId;

    await inscriptionRepository.save(inscription);

    /* -------------------- Notification -------------------- */
    const labels: Record<
      StatutInscription,
      { titre: string; message: string }
    > = {
      [StatutInscription.ACCEPTEE]: {
        titre: '🎉 Inscription acceptée',
        message: `Vous êtes accepté pour « ${inscription.session.formation.titre} ».`,
      },
      [StatutInscription.REFUSEE]: {
        titre: '❌ Inscription refusée',
        message: `Motif : ${motifRefus ?? 'Non précisé'}`,
      },
      [StatutInscription.LISTE_ATTENTE]: {
        titre: '⏳ Liste d\'attente',
        message: `Vous êtes en liste d'attente pour « ${inscription.session.formation.titre} ».`,
      },
      [StatutInscription.EN_ATTENTE]: {
        titre: '⏳ En attente',
        message: 'Votre inscription est en attente de traitement.',
      },
      [StatutInscription.ANNULEE]: {
        titre: '🚫 Annulée',
        message: 'Votre inscription a été annulée.',
      },
    };

    const l = labels[statut];

    await notificationService.create({
      userId: inscription.participantId,
      titre: l.titre,
      message: l.message,
      metadata: {
        inscriptionId: inscription.id,
        sessionId: inscription.sessionId,
      },
    });

    logger.info(`✅ Inscription ${id} → ${statut}`);
    return inscription;
  }

  /* ==========================================================================
     🚫 ANNULER (participant)
     ========================================================================== */
  static async annuler(id: string, userId: string) {
    const inscription = await inscriptionRepository.findByIdOrFail(id);

    if (inscription.participantId !== userId) {
      throw new ForbiddenError(
        'Vous ne pouvez annuler que vos propres inscriptions',
      );
    }

    if (inscription.statut === StatutInscription.ANNULEE) {
      throw new ConflictError('Cette inscription est déjà annulée');
    }

    inscription.statut = StatutInscription.ANNULEE;
    inscription.dateAnnulation = new Date();
    await inscriptionRepository.save(inscription);

    /* -------------------- Notification -------------------- */
    await notificationService.create({
      userId,
      titre: '🚫 Inscription annulée',
      message: `Votre inscription a été annulée. Vous pouvez vous réinscrire à tout moment si la session est encore ouverte.`,
      metadata: {
        inscriptionId: inscription.id,
        sessionId: inscription.sessionId,
      },
    });

    logger.info(`🚫 Inscription annulée : ${id}`);
  }

  /* ==========================================================================
     📩 MES INSCRIPTIONS (participant)
     ========================================================================== */
  static async mesInscriptions(userId: string) {
    return inscriptionRepository.findByParticipant(userId);
  }
}