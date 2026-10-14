import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('partenaires')
export class Partenaire extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  nom: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  secteur: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactTel: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  siteWeb: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;
}