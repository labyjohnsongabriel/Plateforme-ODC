// src/entities/Inscription.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { StatutInscription } from './enums';
import { User } from './User.entity';
import { Session } from './Session.entity';
import { Formation } from './Formation.entity'; // ⭐ AJOUT

@Entity('inscriptions')
@Unique(['sessionId', 'participantId'])
@Index(['statut'])
@Index(['formationId']) // ⭐ AJOUT
export class Inscription extends BaseEntity {
  /* ==========================================================================
     INFORMATIONS
     ========================================================================== */

  @Column({
    type: 'varchar',
    length: 30,
    default: StatutInscription.EN_ATTENTE,
  })
  statut: StatutInscription;

  @Column({ type: 'text', nullable: true, name: 'motif_refus' })
  motifRefus: string;

  @Column({ type: 'text', nullable: true })
  motivation: string;

  @Column({ type: 'int', nullable: true, name: 'score_selection' })
  scoreSelection: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'date_inscription',
  })
  dateInscription: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'date_selection' })
  dateSelection: Date;

  @Column({ type: 'uuid', nullable: true, name: 'selectionne_par' })
  selectionnePar: string;

  /* ==========================================================================
     RELATIONS
     ========================================================================== */

  /* -------------------- Session -------------------- */
  @ManyToOne(() => Session, (s) => s.inscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  /* -------------------- ⭐ Formation (dénormalisée) -------------------- */
  @ManyToOne(() => Formation, (f) => f.inscriptions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  @Column({ name: 'formation_id', type: 'uuid', nullable: true })
  formationId: string;

  /* -------------------- Participant -------------------- */
  @ManyToOne(() => User, (u) => u.inscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ name: 'participant_id' })
  participantId: string;
}