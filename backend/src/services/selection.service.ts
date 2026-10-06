// src/services/selection.service.ts
import { inscriptionRepository } from '../repositories/inscription.repository';
import { sessionRepository } from '../repositories/session.repository';
import { notificationService } from './notification.service';
import { StatutInscription, TypeNotification } from '../entities/enums';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/AppError';
import { logger } from '../config/logger';
import { In } from 'typeorm';

export class SelectionService {
  static async candidatsParSession(sessionId: string, statut?: StatutInscription, page = 1, limit = 20) {
    const session = await sessionRepository.findById(sessionId, ['formation']);
    if (!session) throw new NotFoundError('Session introuvable');

    const all = await inscriptionRepository.findCandidatsBySession(sessionId, statut);
    const total = all.length;
    const stats = await inscriptionRepository.statsBySession(sessionId);

    return {
      data: all.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        ...stats,
        capacite: session.capacite,
        placesRestantes: Math.max(0, session.capacite - stats.acceptees),
      },
    };
  }

  static async selectionnerEnMasse(
    sessionId: string,
    inscriptionIds: string[],
    statut: StatutInscription,
    motifRefus?: string,
  ) {
    if (!inscriptionIds.length) throw new BadRequestError('Aucun candidat sélectionné');
    if (![StatutInscription.ACCEPTEE, StatutInscription.REFUSEE, StatutInscription.LISTE_ATTENTE].includes(statut)) {
      throw new BadRequestError('Statut invalide');
    }

    const session = await sessionRepository.findByIdOrFail(sessionId, ['formation']);

    if (statut === StatutInscription.ACCEPTEE) {
      const acceptedCount = await inscriptionRepository.countAcceptees(sessionId);
      if (acceptedCount + inscriptionIds.length > session.capacite) {
        throw new ConflictError(`Capacité dépassée (capacité: ${session.capacite}, demandé: ${acceptedCount + inscriptionIds.length})`);
      }
    }

    const inscriptions = await inscriptionRepository.findMany({ where: { id: In(inscriptionIds) } } as any);
    if (inscriptions.length !== inscriptionIds.length) {
      throw new NotFoundError('Certaines inscriptions sont introuvables');
    }

    await inscriptionRepository.bulkUpdateStatut(inscriptionIds, statut, motifRefus);

    // Notifications
    for (const i of inscriptions) {
      await notificationService.create({
        userId: i.participantId,
        titre:
          statut === StatutInscription.ACCEPTEE ? '🎉 Inscription acceptée' :
          statut === StatutInscription.REFUSEE  ? '❌ Inscription refusée' :
                                                  '⏳ Liste d\'attente',
        message:
          statut === StatutInscription.ACCEPTEE ? `Vous êtes accepté pour « ${session.formation.titre} »` :
          statut === StatutInscription.REFUSEE  ? `Motif : ${motifRefus ?? 'Non précisé'}` :
                                                  'Vous êtes en liste d\'attente',
        type:
          statut === StatutInscription.ACCEPTEE ? TypeNotification.SUCCESS :
          statut === StatutInscription.REFUSEE  ? TypeNotification.ERROR   :
                                                  TypeNotification.WARNING,
      });
    }

    logger.info(`✅ ${inscriptions.length} inscriptions → ${statut}`);
    return { traites: inscriptions.length, statut };
  }

  static async selectionAutomatique(sessionId: string) {
    const session = await sessionRepository.findByIdOrFail(sessionId, ['formation']);

    const candidats = await inscriptionRepository.findEnAttente(sessionId);
    const acceptedCount = await inscriptionRepository.countAcceptees(sessionId);
    const placesDisponibles = Math.max(0, session.capacite - acceptedCount);

    if (placesDisponibles === 0) {
      return { acceptes: 0, refuses: 0, enAttente: candidats.length, placesDisponibles: 0 };
    }

    const aAccepter = candidats.slice(0, placesDisponibles).map((c) => c.id);
    const aRefuser = candidats.slice(placesDisponibles).map((c) => c.id);

    if (aAccepter.length) {
      await inscriptionRepository.bulkUpdateStatut(aAccepter, StatutInscription.ACCEPTEE);
    }
    if (aRefuser.length) {
      await inscriptionRepository.bulkUpdateStatut(aRefuser, StatutInscription.REFUSEE, 'Capacité atteinte');
    }

    for (const c of candidats.slice(0, placesDisponibles)) {
      await notificationService.create({
        userId: c.participantId,
        titre: '🎉 Inscription acceptée',
        message: `Vous êtes accepté pour « ${session.formation.titre} »`,
        type: TypeNotification.SUCCESS,
      });
    }
    for (const c of candidats.slice(placesDisponibles)) {
      await notificationService.create({
        userId: c.participantId,
        titre: '❌ Inscription refusée',
        message: `Capacité atteinte pour « ${session.formation.titre} »`,
        type: TypeNotification.WARNING,
      });
    }

    logger.info(`🤖 Sélection auto session=${session.codeSession} : ${aAccepter.length} acceptés, ${aRefuser.length} refusés`);
    return { acceptes: aAccepter.length, refuses: aRefuser.length, placesDisponibles };
  }

  static async stats(sessionId: string) {
    const session = await sessionRepository.findByIdOrFail(sessionId);
    const stats = await inscriptionRepository.statsBySession(sessionId);
    return {
      ...stats,
      capacite: session.capacite,
      placesRestantes: Math.max(0, session.capacite - stats.acceptees),
      tauxRemplissage: session.capacite > 0 ? Math.round((stats.acceptees / session.capacite) * 100) : 0,
    };
  }

  static async reset(sessionId: string) {
    const inscriptions = await inscriptionRepository.findBySession(sessionId);
    const ids = inscriptions
      .filter((i) => [StatutInscription.ACCEPTEE, StatutInscription.REFUSEE, StatutInscription.LISTE_ATTENTE].includes(i.statut))
      .map((i) => i.id);
    const count = await inscriptionRepository.bulkUpdateStatut(ids, StatutInscription.EN_ATTENTE);
    logger.info(`🔄 Reset sélections session=${sessionId} (${count})`);
    return { reset: count };
  }
}