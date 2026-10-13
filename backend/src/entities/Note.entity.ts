// src/entities/Note.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Evaluation } from './Evaluation.entity';
import { User } from './User.entity';

@Entity('notes')
@Unique(['evaluationId', 'participantId'])
@Index(['participantId'])
export class Note extends BaseEntity {
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  note: number;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @Column({ type: 'boolean', default: false })
  validee: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'saisie_par' })
  saisiePar: string;

  @Column({ type: 'timestamp', nullable: true, name: 'date_saisie' })
  dateSaisie: Date;

  // ============ RELATIONS ============
  @ManyToOne(() => Evaluation, (e) => e.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ name: 'evaluation_id' })
  evaluationId: string;

  @ManyToOne(() => User, (u) => u.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ name: 'participant_id' })
  participantId: string;
}