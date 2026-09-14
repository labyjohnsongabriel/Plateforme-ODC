import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Session } from './Session.entity';
import { Note } from './Note.entity';

export enum TypeEvaluation {
  QUIZ = 'QUIZ',
  PROJET = 'PROJET',
  EXAMEN = 'EXAMEN',
  TP = 'TP',
  ORAL = 'ORAL',
}

@Entity('evaluations')
export class Evaluation extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  titre: string;

  @Column({ type: 'varchar', length: 50 })
  type: TypeEvaluation;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20, name: 'note_max' })
  noteMax: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10, name: 'note_min' })
  noteMin: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1, name: 'coefficient' })
  coefficient: number;

  @Column({ type: 'date', nullable: true, name: 'date_evaluation' })
  dateEvaluation: Date;

  @Column({ type: 'int', nullable: true, name: 'duree_minutes' })
  dureeMinutes: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  consignes: string;

  @Column({ type: 'boolean', default: true })
  publiee: boolean;

  // Relations
  @ManyToOne(() => Session, (s) => s.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @OneToMany(() => Note, (n) => n.evaluation)
  notes: Note[];
}