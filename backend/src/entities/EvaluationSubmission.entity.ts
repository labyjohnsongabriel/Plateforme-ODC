import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Evaluation } from './Evaluation.entity';
import { User } from './User.entity';

@Entity('evaluation_submissions')
@Unique(['evaluationId', 'participantId'])
@Index(['participantId'])
export class EvaluationSubmission extends BaseEntity {
  @Column({ type: 'jsonb' })
  reponses: Record<string, unknown>;

  @Column({ type: 'timestamp', name: 'soumis_at', default: () => 'CURRENT_TIMESTAMP' })
  soumisAt: Date;

  @ManyToOne(() => Evaluation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ type: 'uuid', name: 'evaluation_id' })
  evaluationId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ type: 'uuid', name: 'participant_id' })
  participantId: string;
}
