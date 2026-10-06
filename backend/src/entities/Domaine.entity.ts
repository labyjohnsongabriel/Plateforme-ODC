// src/entities/Domaine.entity.ts
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Formation } from './Formation.entity';

@Entity('domaines')
@Index(['slug'], { unique: true })
export class Domaine extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  nom: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  couleur: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icone: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string;

  // ============ PUBLICATION ============
  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'boolean', default: true, name: 'est_publiee' })
  estPubliee: boolean;

  @Column({ type: 'int', default: 0, name: 'ordre_affichage' })
  ordreAffichage: number;

  @OneToMany(() => Formation, (f) => f.domaineRelation)
  formations: Formation[];
}