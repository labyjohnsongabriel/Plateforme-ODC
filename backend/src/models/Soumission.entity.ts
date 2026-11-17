// src/entities/Soumission.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Evaluation } from './Evaluation.entity';
import { User } from './User.entity';
import { Reponse } from './Reponse.entity';

export enum StatutSoumission {
  EN_COURS = 'EN_COURS',
  SOUMISE = 'SOUMISE',
  CORRIGEE = 'CORRIGEE',
  PUBLIEE = 'PUBLIEE',
}

@Entity('soumissions')
@Unique(['evaluationId', 'participantId'])
@Index(['evaluationId'])
@Index(['participantId'])
export class Soumission extends BaseEntity {
  // ─── Relations ──────────────────────────────────────────────────────────
  @ManyToOne(() => Evaluation, (e) => e.soumissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ name: 'evaluation_id' })
  evaluationId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ name: 'participant_id' })
  participantId: string;

  // ─── Timing ────────────────────────────────────────────────────────────

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'soumis_at',
  })
  soumisAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'debut_at' })
  debutAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'fin_at' })
  finAt: Date | null;

  /** Temps passé en secondes */
  @Column({ type: 'int', nullable: true, name: 'duree_secondes' })
  dureeSecondes: number | null;

  // ─── Statut et correction ──────────────────────────────────────────────

  @Column({
    type: 'varchar',
    length: 20,
    default: StatutSoumission.SOUMISE,
  })
  statut: StatutSoumission;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'note_obtenue',
  })
  noteObtenue: number | null;

  /** Note max au moment de la soumission (snapshot) */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'note_max_snapshot',
  })
  noteMaxSnapshot: number | null;

  /** Pourcentage de réussite (calculé) */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  pourcentage: number | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  /** Note du formateur / feedback global */
  @Column({ type: 'text', nullable: true, name: 'feedback_formateur' })
  feedbackFormateur: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'corrige_par' })
  corrigePar: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'corrige_at' })
  corrigeAt: Date | null;

  // ─── Relations ──────────────────────────────────────────────────────────
  @OneToMany(() => Reponse, (r) => r.soumission, { cascade: true })
  reponses: Reponse[];
}