import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Role, RoleName } from '../models/Role.entity';
import { hashPassword } from '../utils/password.util';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { MESSAGES } from '../constants/messages';

export class UserService {
  static async create(data: any) {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictError(MESSAGES.AUTH.EMAIL_EXISTS);

    const role = await roleRepo.findOne({ where: { nom: data.roleNom as RoleName } });
    if (!role) throw new NotFoundError('Rôle introuvable');

    const user = userRepo.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      motDePasse: await hashPassword(data.motDePasse),
      telephone: data.telephone,
      ville: data.ville,
      roleId: role.id,
      actif: true,
    });

    await userRepo.save(user);
    return this.findOne(user.id);
  }

  static async findAll(page?: string, limit?: string, filters?: any) {
    const { page: p, limit: l, skip } = getPagination(page, limit);
    const repo = AppDataSource.getRepository(User);

    const qb = repo.createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r');

    if (filters?.role) qb.andWhere('r.nom = :role', { role: filters.role });
    if (filters?.actif !== undefined) qb.andWhere('u.actif = :actif', { actif: filters.actif });
    if (filters?.search) {
      qb.andWhere(
        '(u.nom ILIKE :q OR u.prenom ILIKE :q OR u.email ILIKE :q)',
        { q: `%${filters.search}%` }
      );
    }

    qb.orderBy('u.createdAt', 'DESC').skip(skip).take(l);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: p, limit: l };
  }

  static async findOne(id: string) {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
    return user;
  }

  static async update(id: string, data: any) {
    const user = await this.findOne(id);
    Object.assign(user, data);
    await AppDataSource.getRepository(User).save(user);
    return this.findOne(id);
  }

  static async changeRole(id: string, roleNom: string) {
    const user = await this.findOne(id);
    const roleRepo = AppDataSource.getRepository(Role);
    const role = await roleRepo.findOne({ where: { nom: roleNom as RoleName } });
    if (!role) throw new NotFoundError('Rôle introuvable');

    user.roleId = role.id;
    await AppDataSource.getRepository(User).save(user);
    return this.findOne(id);
  }

  static async toggleActif(id: string, actif: boolean) {
    const user = await this.findOne(id);
    user.actif = actif;
    await AppDataSource.getRepository(User).save(user);
    return user;
  }

  static async delete(id: string) {
    const user = await this.findOne(id);
    await AppDataSource.getRepository(User).softDelete(id);
  }
}