// src/repositories/RoleRepository.ts
import { Role } from '../entities/Role.entity';
import { BaseRepository } from './base.repository';
import { RoleName } from '../entities/enums';

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async findByName(nom: RoleName, withPermissions = true): Promise<Role | null> {
    return this.findOne({ nom } as any, withPermissions ? ['permissions'] : []);
  }

  async findAllWithPermissions(): Promise<Role[]> {
    return this.qb('r')
      .leftJoinAndSelect('r.permissions', 'p')
      .orderBy('r.niveau_hierarchie', 'DESC')
      .getMany();
  }

  async findByIdWithPermissions(id: string): Promise<Role | null> {
    return this.findById(id, ['permissions']);
  }
}

export const roleRepository = new RoleRepository();