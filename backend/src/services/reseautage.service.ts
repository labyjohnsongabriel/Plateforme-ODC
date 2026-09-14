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

    if (conn.destinataireId !== userId) {
      throw new ForbiddenError('Vous ne pouvez pas répondre à cette demande');
    }

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
      where: [
        { expediteurId: userId },
        { destinataireId: userId },
      ],
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
  }
}