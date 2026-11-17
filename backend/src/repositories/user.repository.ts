// src/repositories/UserRepository.ts
import { User } from '../entities/User.entity';
import { BaseRepository } from './base.repository';
import { RoleName, StatutInscription } from '../entities/enums';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /** Recherche par email (avec mot de passe pour login) */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.qb('u')
      .addSelect('u.motDePasse')
      .leftJoinAndSelect('u.role', 'r')
      .leftJoinAndSelect('r.permissions', 'p')
      .where('u.email = :email', { email })
      .getOne();
  }

  /** Recherche par email (profil simple) */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as any, ['role']);
  }

  /** Utilisateur complet avec toutes ses relations de profil */
  async findWithProfile(id: string): Promise<User | null> {
    return this.findById(id, ['role', 'role.permissions']);
  }

  /** Tous les utilisateurs actifs par rôle */
  async findByRole(role: RoleName): Promise<User[]> {
    return this.qb('u')
      .leftJoin('u.role', 'r')
      .where('r.nom = :role', { role })
      .andWhere('u.actif = true')
      .getMany();
  }

  /** Annuaire public (profils publics uniquement) */
  async findPublicDirectory(
    excludeId: string,
    opts: { page?: number; limit?: number; q?: string; roleId?: string } = {},
  ) {
    const page = Math.max(1, Number(opts.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(opts.limit) || 10));

    const qb = this.qb('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.id != :excludeId', { excludeId })
      .andWhere('u.actif = true')
      .andWhere('u.profilPublic = true');

    if (opts.q) {
      qb.andWhere(
        '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.entreprise ILIKE :q OR u.competences::text ILIKE :q)',
        { q: `%${opts.q}%` },
      );
    }
    if (opts.roleId) qb.andWhere('u.role_id = :rid', { rid: opts.roleId });

    qb.orderBy('u.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Recherche multi-critères paginée (admin) */
  async search(
    filters: { roleId?: string; actif?: boolean; q?: string },
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const qb = this.qb('u').leftJoinAndSelect('u.role', 'r');

    if (filters.roleId) qb.andWhere('u.role_id = :rid', { rid: filters.roleId });
    if (filters.actif !== undefined) qb.andWhere('u.actif = :a', { a: filters.actif });
    if (filters.q) {
      qb.andWhere(
        '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.email ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    qb.orderBy('u.created_at', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Statistiques par rôle */
  async statsByRole(): Promise<Array<{ role: string; count: number }>> {
    const raw = await this.qb('u')
      .leftJoin('u.role', 'r')
      .select('r.nom', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.actif = true')
      .groupBy('r.nom')
      .getRawMany();
    return raw.map((r) => ({ role: r.role, count: Number(r.count) }));
  }

  /** Participants acceptés pour une session donnée */
  async findAcceptedForSession(sessionId: string): Promise<User[]> {
    return this.qb('u')
      .innerJoin('u.inscriptions', 'i')
      .where('i.session_id = :sid', { sid: sessionId })
      .andWhere('i.statut = :st', { st: StatutInscription.ACCEPTEE })
      .getMany();
  }
}

export const userRepository = new UserRepository();