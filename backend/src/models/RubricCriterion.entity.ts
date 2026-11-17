// src/entities/RubricCriterion.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Evaluation } from './Evaluation.entity';

@Entity('rubric_criteria')
@Index(['evaluationId'])
export class RubricCriterion extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Poids relatif (ex: 2 pour "très important") */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  poids: number;

  /** Note maximale pour ce critère */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 5,
    name: 'note_max',
  })
  noteMax: number;

  @Column({ type: 'int', default: 0 })
  ordre: number;

  // ─── Relations ──────────────────────────────────────────────────────────
  @ManyToOne(() => Evaluation, (e) => e.rubric, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ name: 'evaluation_id' })
  evaluationId: string;
}