// src/entities/Role.entity.ts
import { Entity, Column, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { RoleName } from './enums';
import { User } from './User.entity';
import { Permission } from './Permission.entity';

@Entity('roles')
@Index(['nom'], { unique: true })
export class Role extends BaseEntity {
  // ==========================================================================
  // 🎭 IDENTIFICATION
  // ==========================================================================
  @Column({ type: 'varchar', length: 50, unique: true })
  nom: RoleName;

  /**
   * ⚠️ `default: ''` ajouté pour éviter l'erreur lors de l'ajout
   * de la colonne sur une table contenant déjà des lignes.
   */
  @Column({ type: 'varchar', length: 150, default: '' })
  libelle: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // ==========================================================================
  // 🎨 UI / HIÉRARCHIE
  // ==========================================================================
  @Column({ type: 'int', default: 0, name: 'niveau_hierarchie' })
  niveauHierarchie: number;

  @Column({ type: 'varchar', length: 20, nullable: true, default: '#6B7280' })
  couleur: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icone: string | null;

  // ==========================================================================
  // 🔐 ÉTAT
  // ==========================================================================
  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'boolean', default: false, name: 'est_systeme' })
  estSysteme: boolean;

  // ==========================================================================
  // 🔗 RELATIONS
  // ==========================================================================
  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Permission, (p) => p.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}