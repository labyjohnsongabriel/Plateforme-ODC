// src/entities/Question.entity.ts
import {
  Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Evaluation } from './Evaluation.entity';
import { QuestionOption } from './QuestionOption.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'text' })
  enonce!: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 1 })
  points!: number;

  @Column({ type: 'boolean', default: true })
  obligatoire!: boolean;

  @Column({ type: 'integer', default: 0 })
  ordre!: number;

  @Column({ name: 'bonne_reponse', type: 'text', nullable: true })
  bonneReponse!: string | null;

  @Column({ type: 'text', nullable: true })
  explication!: string | null;

  @Column({ name: 'evaluation_id', type: 'uuid' })
  evaluationId!: string;

  @ManyToOne(() => Evaluation, (e) => e.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation!: Evaluation;

  @OneToMany(() => QuestionOption, (o) => o.question, {
    cascade: true,
    eager: false,
  })
  options!: QuestionOption[];
}