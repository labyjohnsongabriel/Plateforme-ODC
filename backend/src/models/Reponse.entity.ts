import {
  Entity, Column, ManyToOne, JoinColumn, Index, Unique,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Soumission } from './Soumission.entity';
import { Question } from './Question.entity';

@Entity('reponses')
@Unique(['soumissionId', 'questionId'])
@Index(['soumissionId'])
export class Reponse extends BaseEntity {
  @ManyToOne(() => Soumission, (s) => s.reponses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'soumission_id' })
  soumission: Soumission;

  @Column({ name: 'soumission_id' })
  soumissionId: string;

  @ManyToOne(() => Question, (q) => q.reponses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'question_id' })
  questionId: string;

  // ─── Réponses selon le type ────────────────────────────────────────────

  @Column({ type: 'text', nullable: true })
  texte: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'fichier_url' })
  fichierUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'nom_fichier' })
  nomFichier: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'option_id' })
  optionId: string | null;

  /** Tableau d'ids pour QCM_MULTIPLE (TypeORM: simple-array) */
  @Column({ type: 'simple-array', nullable: true, name: 'option_ids' })
  optionIds: string[] | null;

  @Column({ type: 'boolean', nullable: true, name: 'valeur_bool' })
  valeurBool: boolean | null;
}