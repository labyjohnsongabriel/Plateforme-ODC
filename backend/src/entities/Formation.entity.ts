// src/entities/Formation.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NiveauFormation } from './enums';
import { Session } from './Session.entity';
import { Inscription } from './Inscription.entity';
import { Domaine } from './Domaine.entity';

/* ============================================================================
   FORMATION ENTITY
   ============================================================================ */

@Entity('formations')
@Index(['slug'], { unique: true })
@Index(['actif'])
@Index(['estPubliee'])
@Index(['domaineId'])
export class Formation {
  /* ==========================================================================
     IDENTIFIANT
     ========================================================================== */

  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* ==========================================================================
     INFORMATIONS GÉNÉRALES
     ========================================================================== */

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

  /* ==========================================================================
     MÉDIAS
     ========================================================================== */

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'image_couverture_url',
  })
  imageCouvertureUrl: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'video_presentation_url',
  })
  videoPresentationUrl: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  prix: number;

  /* ==========================================================================
     PUBLICATION
     ========================================================================== */

  @Column({ type: 'boolean', default: false, name: 'est_publiee' })
  estPubliee: boolean;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'mise_en_avant',
  })
  miseEnAvant: boolean;

  @Column({ type: 'int', default: 0, name: 'nb_participants_max' })
  nbParticipantsMax: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'date_publication',
  })
  datePublication: Date;

  @Column({ type: 'int', default: 0, name: 'nb_vues' })
  nbVues: number;

  /* ==========================================================================
     RELATIONS
     ========================================================================== */

  /* -------------------- Domaine -------------------- */
  @ManyToOne(() => Domaine, (d) => d.formations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'domaine_id' })
  domaineRelation: Domaine;

  @Column({ name: 'domaine_id', nullable: true })
  domaineId: string;

  /* -------------------- Sessions -------------------- */
  @OneToMany(() => Session, (s) => s.formation)
  sessions: Session[];

  /* -------------------- ⭐ Inscriptions (indirect via sessions) -------------------- */
  @OneToMany(() => Inscription, (i) => i.formation)
  inscriptions: Inscription[];

  /* ==========================================================================
     ⭐ CHAMPS CALCULÉS (non persistés)
     ========================================================================== */

  sessionsCount?: number;
  inscriptionsCount?: number;
  domaine?: Domaine;

  /* ==========================================================================
     AUDIT
     ========================================================================== */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}