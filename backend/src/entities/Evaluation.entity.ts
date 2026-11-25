// src/entities/Evaluation.entity.ts
import {
  Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Session } from './Session.entity';
import { User } from './User.entity';
import { Question } from './Question.entity';              // ⚠️ './' pas '../models/'
import { RubricCriterion } from './RubricCriterion.entity';
import { Soumission } from './Soumission.entity';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'varchar', length: 200 })
  titre!: string;

  @Column({ type: 'varchar', length: 50, default: 'QUIZ' })
  type!: string;

  @Column({ name: 'note_max', type: 'numeric', precision: 5, scale: 2, default: 20 })
  noteMax!: number;

  @Column({ name: 'note_min_passage', type: 'numeric', precision: 5, scale: 2, default: 10 })
  noteMinPassage!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 1 })
  coefficient!: number;

  @Column({ name: 'date_evaluation', type: 'date', nullable: true })
  dateEvaluation!: Date | null;

  // ✅ AJOUT : Fenêtre temporelle pour la disponibilité de l'évaluation
  @Column({ name: 'date_debut', type: 'timestamp', nullable: true })
  dateDebut!: Date | null;

  @Column({ name: 'date_fin', type: 'timestamp', nullable: true })
  dateFin!: Date | null;

  @Column({ name: 'duree_minutes', type: 'integer', nullable: true })
  dureeMinutes!: number | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  consignes!: string | null;

  @Column({ type: 'boolean', default: false })
  publiee!: boolean;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @Column({ name: 'createur_id', type: 'uuid', nullable: true })
  createurId!: string | null;

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: Session;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createur_id' })
  createur!: User | null;

  @OneToMany(() => Question, (q) => q.evaluation, {
    cascade: true,
    eager: false,
  })
  questions!: Question[];

  @OneToMany(() => RubricCriterion, (r) => r.evaluation, {
    cascade: true,
    eager: false,
  })
  rubric!: RubricCriterion[];

  @OneToMany(() => Soumission, (s) => s.evaluation, {
    cascade: true,
    eager: false,
  })
  soumissions!: Soumission[];
}