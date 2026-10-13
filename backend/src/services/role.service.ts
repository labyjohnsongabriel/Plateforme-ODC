 // src/services/role.service.ts
import { roleRepository } from '../repositories/RoleRepository';
import { AppDataSource } from '../config/database';
import { Permission } from '../entities/Permission.entity';
import { NotFoundError, ConflictError, ForbiddenError } from '../errors/AppError';
import { In } from 'typeorm';

export class RoleService {
  static async findAll() {
    return roleRepository.findAllWithPermissions();
  }

  static async findById(id: string) {
    const role = await roleRepository.findByIdWithPermissions(id);
    if (!role) throw new NotFoundError('Rôle introuvable');
    return role;
  }

  static async create(data: any) {
    const { nom, libelle, permissionCodes } = data;
    if (await roleRepository.findByName(nom, false)) {
      throw new ConflictError('Rôle déjà existant');
    }
    let permissions: Permission[] = [];
    if (Array.isArray(permissionCodes) && permissionCodes.length) {
      permissions = await AppDataSource.getRepository(Permission).find({
        where: { code: In(permissionCodes) },
      });
    }
    return roleRepository.create({ ...data, permissions });
  }

  static async update(id: string, data: any) {
    const role = await roleRepository.findByIdOrFail(id, ['permissions']);
    if (role.estSysteme && data.nom && data.nom !== role.nom) {
      throw new ForbiddenError('Le nom d\'un rôle système ne peut pas être modifié');
    }
    if (Array.isArray(data.permissionCodes)) {
      role.permissions = await AppDataSource.getRepository(Permission).find({
        where: { code: In(data.permissionCodes) },
      });
      delete data.permissionCodes;
    }
    Object.assign(role, data);
    return roleRepository.save(role);
  }

  static async delete(id: string) {
    const role = await roleRepository.findByIdOrFail(id);
    if (role.estSysteme) throw new ForbiddenError('Rôle système non supprimable');
    await roleRepository.softDelete(id);
  }

  static async listPermissions() {
    return AppDataSource.getRepository(Permission).find({
      order: { categorie: 'ASC', code: 'ASC' },
    });
  }
}