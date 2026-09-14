import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Permission } from './Permission.entity';

export enum RoleName {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  FORMATEUR = 'FORMATEUR',
  PARTICIPANT = 'PARTICIPANT',
  PARTENAIRE = 'PARTENAIRE',
}

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  nom: RoleName;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}