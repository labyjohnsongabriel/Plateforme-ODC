// src/entities/Evaluation.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { TypeEvaluation } from './enums';
import { Session } from './Session.entity';
import { User } from './User.entity';
import { Note } from './Note.entity';

@Entity('evaluations')
@Index(['sessionId'])
export class Evaluation extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  titre: string;

  @Column({ type: 'varchar', length: 50, default: TypeEvaluation.QUIZ })
  type: TypeEvaluation;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20, name: 'note_max' })
  noteMax: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10, name: 'note_min_passage' })
  noteMinPassage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  coefficient: number;

  @Column({ type: 'date', nullable: true, name: 'date_evaluation' })
  dateEvaluation: Date;

  @Column({ type: 'int', nullable: true, name: 'duree_minutes' })
  dureeMinutes: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  consignes: string;

  @Column({ type: 'boolean', default: false })
  publiee: boolean;

  // ============ RELATIONS ============
  @ManyToOne(() => Session, (s) => s.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createur_id' })
  createur: User;

  @Column({ name: 'createur_id', nullable: true })
  createurId: string;

  @OneToMany(() => Note, (n) => n.evaluation)
  notes: Note[];
}