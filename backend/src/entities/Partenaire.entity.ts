// src/entities/Partenaire.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('partenaires')
@Index(['slug'], { unique: true })
export class Partenaire extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  nom: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  secteur: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 150, nullable: true, name: 'contact_email' })
  contactEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact_tel' })
  contactTel: string;

  @Column({ type: 'varchar', length: 300, nullable: true, name: 'site_web' })
  siteWeb: string;

  // ============ IMAGE ============
  @Column({ type: 'text', nullable: true, name: 'logo_url' })
  logoUrl: string;

  // ============ PUBLICATION ============
  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'boolean', default: true, name: 'est_publiee' })
  estPubliee: boolean;

  @Column({ type: 'int', default: 0, name: 'ordre_affichage' })
  ordreAffichage: number;
}