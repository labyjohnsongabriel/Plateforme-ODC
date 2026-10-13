// src/entities/Formation.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NiveauFormation } from './enums';
import { Session } from './Session.entity';
import { Domaine } from './Domaine.entity';

@Entity('formations')
@Index(['slug'], { unique: true })
@Index(['actif'])
@Index(['estPubliee'])
export class Formation extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  titre: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectifs: string;

  @Column({ type: 'text', nullable: true })
  prerequis: string;

  @Column({ type: 'text', nullable: true })
  programme: string;

  @Column({ type: 'varchar', length: 50 })
  niveau: NiveauFormation;

  @Column({ type: 'int', name: 'duree_heures' })
  dureeHeures: number;

  // ============ IMAGES / MÉDIAS ============
  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'text', nullable: true, name: 'image_couverture_url' })
  imageCouvertureUrl: string;

  @Column({ type: 'text', nullable: true, name: 'video_presentation_url' })
  videoPresentationUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix: number;

  // ============ PUBLICATION (pages publiques) ============
  @Column({ type: 'boolean', default: false, name: 'est_publiee' })
  estPubliee: boolean;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'boolean', default: true, name: 'mise_en_avant' })
  miseEnAvant: boolean;

  @Column({ type: 'int', default: 0, name: 'nb_participants_max' })
  nbParticipantsMax: number;

  @Column({ type: 'timestamp', nullable: true, name: 'date_publication' })
  datePublication: Date;

  @Column({ type: 'int', default: 0, name: 'nb_vues' })
  nbVues: number;

  // ============ RELATIONS ============
  @ManyToOne(() => Domaine, (d) => d.formations, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'domaine_id' })
  domaineRelation: Domaine;

  @Column({ name: 'domaine_id', nullable: true })
  domaineId: string;

  @OneToMany(() => Session, (s) => s.formation)
  sessions: Session[];
}