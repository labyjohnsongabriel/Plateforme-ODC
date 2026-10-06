// src/services/reseautage.service.ts
import { userRepository }      from '../repositories/user.repository';
import { connectionRepository } from '../repositories/ConnectionRepository';
import { notificationService } from './notification.service';
import { StatutConnection, TypeNotification, RoleName } from '../entities/enums';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { In } from 'typeorm';
import { logger } from '../config/logger';

export interface AnnuaireFilters {
  ville?: string;
  role?: RoleName;
  entreprise?: string;
  competence?: string;
  search?: string;
}

export interface PaginationInput {
  page?: string | number;
  limit?: string | number;
}

export class ReseautageService {
  // =====================================================================
  // 📇 ANNUAIRE DES MEMBRES
  // =====================================================================
  /**
   * Annuaire paginé des utilisateurs publics (hors soi-même).
   * Filtres : ville, rôle, entreprise, compétence, recherche libre.
   */
  static async annuaire(
    currentUserId: string,
    pagination: PaginationInput = {},
    filters: AnnuaireFilters = {},
  ) {
    const { page, limit } = getPagination(pagination.page, pagination.limit);

    const qb = userRepository.raw
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.id != :uid', { uid: currentUserId })
      .andWhere('u.actif = true')
      .andWhere('u.profil_public = true');

    if (filters.ville) {
      qb.andWhere('u.ville ILIKE :ville', { ville: `%${filters.ville}%` });
    }
    if (filters.entreprise) {
      qb.andWhere('u.entreprise ILIKE :entreprise', { entreprise: `%${filters.entreprise}%` });
    }
    if (filters.role) {
      qb.andWhere('r.nom = :role', { role: filters.role });
    }
    if (filters.competence) {
      qb.andWhere('u.competences::text ILIKE :comp', { comp: `%${filters.competence}%` });
    }
    if (filters.search) {
      qb.andWhere(
        `(
          u.nom ILIKE :q
          OR u.prenom ILIKE :q
          OR u.bio ILIKE :q
          OR u.entreprise ILIKE :q
          OR u.poste ILIKE :q
        )`,
        { q: `%${filters.search}%` },
      );
    }

    qb.orderBy('u.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    // ⚠️ motDePasse a `select: false` → déjà exclu automatiquement
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // =====================================================================
  // 📨 ENVOYER UNE DEMANDE DE CONNEXION
  // =====================================================================
  /**
   * Envoie une demande de connexion à un autre utilisateur.
   * Règles :
   *   - impossible de s'envoyer à soi-même
   *   - le destinataire doit être actif et avec profil public
   *   - pas de doublon (dans un sens ou l'autre)
   *   - pas de redemande après refus
   */
  static async envoyerDemande(
    expediteurId: string,
    destinataireId: string,
    message?: string,
  ) {
    if (expediteurId === destinataireId) {
      throw new BadRequestError('Impossible de s\'ajouter soi-même');
    }

    const destinataire = await userRepository.findById(destinataireId);
    if (!destinataire || !destinataire.actif) {
      throw new NotFoundError('Utilisateur introuvable ou inactif');
    }

    // Vérifier s'il existe déjà une connexion (dans un sens ou l'autre)
    const existing = await connectionRepository.findBetween(expediteurId, destinataireId);
    if (existing) {
      if (existing.statut === StatutConnection.REFUSEE) {
        throw new ConflictError('Cette demande a déjà été refusée');
      }
      if (existing.statut === StatutConnection.ACCEPTEE) {
        throw new ConflictError('Vous êtes déjà connectés');
      }
      throw new ConflictError('Une demande est déjà en attente');
    }

    const conn = await connectionRepository.create({
      expediteurId,
      destinataireId,
      message: message?.trim() || undefined,
      statut: StatutConnection.EN_ATTENTE,
    });

    await notificationService.create({
      userId: destinataireId,
      titre: '👥 Nouvelle demande de connexion',
      message: 'Vous avez reçu une nouvelle demande de connexion',
      type: TypeNotification.INFO,
      metadata: { connectionId: conn.id, expediteurId },
    });

    logger.info(`👥 Demande de connexion : ${expediteurId} → ${destinataireId}`);
    return conn;
  }

  // =====================================================================
  // ✅ RÉPONDRE À UNE DEMANDE (accepter / refuser)
  // =====================================================================
  static async repondre(
    connectionId: string,
    userId: string,
    statut: StatutConnection,
  ) {
    // Validation du statut
    if (![StatutConnection.ACCEPTEE, StatutConnection.REFUSEE].includes(statut)) {
      throw new BadRequestError('Statut invalide : ACCEPTEE ou REFUSEE attendu');
    }

    const conn = await connectionRepository.findByIdOrFail(connectionId);

    // Seul le destinataire peut répondre
    if (conn.destinataireId !== userId) {
      throw new ForbiddenError('Vous ne pouvez pas répondre à cette demande');
    }

    // Empêcher la double réponse
    if (conn.statut !== StatutConnection.EN_ATTENTE) {
      throw new ConflictError('Cette demande a déjà été traitée');
    }

    conn.statut = statut;
    conn.dateReponse = new Date(); // ⚠️ Manquait dans la version initiale
    await connectionRepository.save(conn);

    // Notifier l'expéditeur
    await notificationService.create({
      userId: conn.expediteurId,
      titre: statut === StatutConnection.ACCEPTEE ? '✅ Connexion acceptée' : '❌ Connexion refusée',
      message:
        statut === StatutConnection.ACCEPTEE
          ? 'Votre demande de connexion a été acceptée'
          : 'Votre demande de connexion a été refusée',
      type:
        statut === StatutConnection.ACCEPTEE
          ? TypeNotification.SUCCESS
          : TypeNotification.WARNING,
      metadata: { connectionId: conn.id },
    });

    logger.info(`📩 Demande ${connectionId} → ${statut}`);
    return conn;
  }

  // =====================================================================
  // 🤝 MES CONNEXIONS ACCEPTÉES
  // =====================================================================
  static async mesConnections(userId: string) {
    const connections = await connectionRepository.findAccepted(userId);

    return connections.map((c) => {
      const isExpediteur = c.expediteurId === userId;
      const other = isExpediteur ? c.destinataire : c.expediteur;
      return {
        connectionId: c.id,
        since: c.dateReponse ?? c.updatedAt,
        user: other, // motDePasse est déjà exclu (select: false)
      };
    });
  }

  // =====================================================================
  // ⏳ DEMANDES EN ATTENTE (reçues)
  // =====================================================================
  static async demandesEnAttente(userId: string) {
    return connectionRepository.findEnAttente(userId);
  }

  // =====================================================================
  // 📤 DEMANDES ENVOYÉES (en attente)
  // =====================================================================
  static async demandesEnvoyees(userId: string) {
    return connectionRepository.raw
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.destinataire', 'd')
      .leftJoinAndSelect('d.role', 'dr')
      .where('c.expediteur_id = :uid', { uid: userId })
      .andWhere('c.statut = :st', { st: StatutConnection.EN_ATTENTE })
      .orderBy('c.created_at', 'DESC')
      .getMany();
  }

  // =====================================================================
  // 💡 SUGGESTIONS (membres non encore connectés)
  // =====================================================================
  static async suggestions(userId: string, limit = 10) {
    // Toutes les connexions existantes (peu importe le statut)
    const existing = await connectionRepository.raw.find({
      where: [
        { expediteurId: userId },
        { destinataireId: userId },
      ],
      select: ['expediteurId', 'destinataireId'],
    });

    const excludedIds = new Set<string>([userId]);
    for (const c of existing) {
      excludedIds.add(c.expediteurId === userId ? c.destinataireId : c.expediteurId);
    }

    const users = await userRepository.raw
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.actif = true')
      .andWhere('u.profil_public = true')
      .andWhere('u.id NOT IN (:...ids)', { ids: [...excludedIds] })
      .orderBy('RANDOM()')
      .limit(Math.min(50, Math.max(1, limit)))
      .getMany();

    return users;
  }

  // =====================================================================
  // 🗑️ SUPPRIMER UNE CONNEXION (déconnexion)
  // =====================================================================
  static async supprimerConnection(connectionId: string, userId: string) {
    const conn = await connectionRepository.findByIdOrFail(connectionId);

    if (conn.expediteurId !== userId && conn.destinataireId !== userId) {
      throw new ForbiddenError('Vous n\'êtes pas concerné par cette connexion');
    }

    await connectionRepository.softDelete(connectionId);

    const otherId = conn.expediteurId === userId ? conn.destinataireId : conn.expediteurId;
    await notificationService.create({
      userId: otherId,
      titre: '🔌 Connexion retirée',
      message: 'Une de vos connexions a été retirée',
      type: TypeNotification.INFO,
    });

    logger.info(`🗑️ Connexion supprimée : ${connectionId}`);
  }

  // =====================================================================
  // 📊 STATISTIQUES RÉSEAU
  // =====================================================================
  static async statsReseau(userId: string) {
    const [connections, envoyees, recues] = await Promise.all([
      connectionRepository.count({
        where: [
          { expediteurId: userId, statut: StatutConnection.ACCEPTEE },
          { destinataireId: userId, statut: StatutConnection.ACCEPTEE },
        ],
      } as any),
      connectionRepository.count({
        where: { expediteurId: userId, statut: StatutConnection.EN_ATTENTE },
      } as any),
      connectionRepository.count({
        where: { destinataireId: userId, statut: StatutConnection.EN_ATTENTE },
      } as any),
    ]);

    return {
      connections,
      demandesEnvoyees: envoyees,
      demandesRecues: recues,
    };
  }
}