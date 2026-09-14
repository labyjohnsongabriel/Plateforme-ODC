import { FindOptionsWhere } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { User } from '../models/User.entity';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /**
   * Trouve par email (avec mot de passe pour l'auth)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('u')
      .addSelect('u.motDePasse')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.email = :email', { email })
      .getOne();
  }

  /**
   * Trouve par email (sans mot de passe)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  /**
   * Liste paginée avec filtres
   */
  async findByFilters(params: {
    page: number;
    limit: number;
    role?: string;
    actif?: boolean;
    search?: string;
  }) {
    const qb = this.repository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r');

    if (params.role) {
      qb.andWhere('r.nom = :role', { role: params.role });
    }
    if (params.actif !== undefined) {
      qb.andWhere('u.actif = :actif', { actif: params.actif });
    }
    if (params.search) {
      qb.andWhere(
        '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.email ILIKE :q)',
        { q: `%${params.search}%` }
      );
    }

    qb.orderBy('u.created_at', 'DESC')
      .skip((params.page - 1) * params.limit)
      .take(params.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Nombre d'utilisateurs par rôle
   */
  async countByRole(): Promise<{ role: string; count: number }[]> {
    return this.repository
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .groupBy('r.nom')
      .getRawMany();
  }

  /**
   * Recherche annuaire
   */
  async searchDirectory(params: {
    excludeId: string;
    search?: string;
    role?: string;
    ville?: string;
    page: number;
    limit: number;
  }) {
    const qb = this.repository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.id != :uid', { uid: params.excludeId })
      .andWhere('u.actif = true');

    if (params.search) {
      qb.andWhere(
        '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.bio ILIKE :q)',
        { q: `%${params.search}%` }
      );
    }
    if (params.role) {
      qb.andWhere('r.nom = :role', { role: params.role });
    }
    if (params.ville) {
      qb.andWhere('u.ville ILIKE :ville', { ville: `%${params.ville}%` });
    }

    qb.orderBy('u.created_at', 'DESC')
      .skip((params.page - 1) * params.limit)
      .take(params.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}