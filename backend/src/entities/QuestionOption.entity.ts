// src/entities/QuestionOption.entity.ts
import {
  Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Question } from './Question.entity';    // ⚠️ './'

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'varchar', length: 500 })
  label!: string;

  @Column({ type: 'boolean', default: false })
  correct!: boolean;

  @Column({ type: 'integer', default: 0 })
  ordre!: number;

  @Column({ type: 'text', nullable: true })
  explication!: string | null;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @ManyToOne(() => Question, (q) => q.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: Question;
}