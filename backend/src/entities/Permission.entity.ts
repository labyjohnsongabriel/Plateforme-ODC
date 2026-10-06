// src/entities/Permission.entity.ts
import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  libelle: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categorie: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}