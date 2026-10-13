<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Connection, StatutConnection } from '../models/Connection.entity';
import { NotFoundError, ConflictError, ForbiddenError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { Not, In } from 'typeorm';
import { NotificationService } from './notification.service';
import { TypeNotification } from '../models/Notification.entity';

export class ReseautageService {
  /**
   * Annuaire des membres (avec filtres)
   */
  static async annuaire(
    currentUserId: string,
    page?: string,
    limit?: string,
    filters?: { domaine?: string; ville?: string; search?: string; role?: string }
  ) {
    const { page: p, limit: l, skip } = getPagination(page, limit);
    const repo = AppDataSource.getRepository(User);

    const qb = repo.createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.id != :uid', { uid: currentUserId })
      .andWhere('u.actif = true');

    if (filters?.ville) qb.andWhere('u.ville ILIKE :ville', { ville: `%${filters.ville}%` });
    if (filters?.role) qb.andWhere('r.nom = :role', { role: filters.role });
    if (filters?.search) {
      qb.andWhere(
        '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.bio ILIKE :q)',
        { q: `%${filters.search}%` }
      );
    }

    qb.orderBy('u.createdAt', 'DESC').skip(skip).take(l);

    const [data, total] = await qb.getManyAndCount();

    // Nettoyer les données sensibles
    const cleaned = data.map(({ motDePasse, ...rest }) => rest);

    return { data: cleaned, total, page: p, limit: l };
  }

  /**
   * Envoyer une demande de connexion
   */
  static async envoyerDemande(expediteurId: string, destinataireId: string, message?: string) {
    if (expediteurId === destinataireId) {
      throw new ForbiddenError('Impossible de se connecter à soi-même');
    }

    const userRepo = AppDataSource.getRepository(User);
    const dest = await userRepo.findOne({ where: { id: destinataireId } });
    if (!dest || !dest.actif) throw new NotFoundError('Utilisateur introuvable');

    const connRepo = AppDataSource.getRepository(Connection);
    const existing = await connRepo.findOne({
      where: [
        { expediteurId, destinataireId },
        { expediteurId: destinataireId, destinataireId: expediteurId },
      ],
    });
    if (existing) throw new ConflictError('Demande déjà envoyée ou existante');

    const conn = connRepo.create({
      expediteurId,
      destinataireId,
      message,
      statut: StatutConnection.EN_ATTENTE,
    });
    await connRepo.save(conn);

    // Notification
    await NotificationService.create({
      userId: destinataireId,
      titre: 'Nouvelle demande de connexion',
      message: `Vous avez reçu une demande de connexion`,
      type: TypeNotification.INFO,
      metadata: { connectionId: conn.id },
    });

    return conn;
  }

  /**
   * Répondre à une demande
   */
  static async repondre(connectionId: string, userId: string, statut: StatutConnection) {
    const connRepo = AppDataSource.getRepository(Connection);
    const conn = await connRepo.findOne({ where: { id: connectionId } });
    if (!conn) throw new NotFoundError('Demande introuvable');

=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    if (conn.destinataireId !== userId) {
      throw new ForbiddenError('Vous ne pouvez pas répondre à cette demande');
    }

<<<<<<< HEAD
    conn.statut = statut;
    await connRepo.save(conn);

    // Notifier l'expéditeur
    await NotificationService.create({
      userId: conn.expediteurId,
      titre: statut === StatutConnection.ACCEPTEE ? 'Connexion acceptée' : 'Connexion refusée',
      message: `Votre demande a été ${statut === StatutConnection.ACCEPTEE ? 'acceptée' : 'refusée'}`,
      type: statut === StatutConnection.ACCEPTEE ? TypeNotification.SUCCESS : TypeNotification.WARNING,
    });

    return conn;
  }

  /**
   * Mes connexions acceptées
   */
  static async mesConnections(userId: string) {
    const connRepo = AppDataSource.getRepository(Connection);
    const connections = await connRepo.find({
      where: [
        { expediteurId: userId, statut: StatutConnection.ACCEPTEE },
        { destinataireId: userId, statut: StatutConnection.ACCEPTEE },
      ],
      relations: ['expediteur', 'expediteur.role', 'destinataire', 'destinataire.role'],
    });

    return connections.map((c) => {
      const isExp = c.expediteurId === userId;
      const other = isExp ? c.destinataire : c.expediteur;
      const { motDePasse, ...clean } = other;
      return { connectionId: c.id, user: clean };
    });
  }

  /**
   * Demandes en attente reçues
   */
  static async demandesEnAttente(userId: string) {
    const repo = AppDataSource.getRepository(Connection);
    return repo.find({
      where: { destinataireId: userId, statut: StatutConnection.EN_ATTENTE },
      relations: ['expediteur', 'expediteur.role'],
    });
  }

  /**
   * Suggestions (membres non encore connectés)
   */
  static async suggestions(userId: string, limit = 10) {
    const connRepo = AppDataSource.getRepository(Connection);
    const userRepo = AppDataSource.getRepository(User);

    // Récupérer les IDs déjà connectés ou en attente
    const existing = await connRepo.find({
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      where: [
        { expediteurId: userId },
        { destinataireId: userId },
      ],
<<<<<<< HEAD
    });
    const excludedIds = [
      userId,
      ...existing.map((c) => (c.expediteurId === userId ? c.destinataireId : c.expediteurId)),
    ];

    const users = await userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.actif = true')
      .andWhere('u.id NOT IN (:...ids)', { ids: excludedIds })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    return users.map(({ motDePasse, ...rest }) => rest);
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}