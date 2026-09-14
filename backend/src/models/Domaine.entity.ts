import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Formation } from './Formation.entity';

@Entity('domaines')
export class Domaine extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  couleur: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icone: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @OneToMany(() => Formation, (f) => f.domaineRelation)
  formations: Formation[];
}