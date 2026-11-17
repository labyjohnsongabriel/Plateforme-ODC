// src/models/Reponse.entity.ts
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, Unique, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { Soumission } from './Soumission.entity';
import { Question } from './Question.entity';

@Entity('reponses')
@Unique(['soumissionId', 'questionId'])
export class Reponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'soumission_id', type: 'uuid' })
  soumissionId!: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @Column({ type: 'text', nullable: true })
  texte!: string | null;

  @Column({ name: 'fichier_url', type: 'varchar', length: 500, nullable: true })
  fichierUrl!: string | null;

  @Column({ name: 'nom_fichier', type: 'varchar', length: 255, nullable: true })
  nomFichier!: string | null;

  /** QCM / VRAI_FAUX — ID textuel de l'option choisie */
  @Column({ name: 'option_id', type: 'varchar', length: 50, nullable: true })
  optionId!: string | null;

  /** QCM_MULTIPLE — tableau JSON d'IDs, stocké en TEXT */
  @Column({ name: 'option_ids', type: 'text', nullable: true })
  optionIdsRaw!: string | null;

  /** VRAI_FAUX */
  @Column({ name: 'valeur_bool', type: 'boolean', nullable: true })
  valeurBool!: boolean | null;

  @Column({ name: 'note_obtenue', type: 'numeric', precision: 5, scale: 2, nullable: true })
  noteObtenue!: number | null;

  @Column({ type: 'boolean', nullable: true })
  correcte!: boolean | null;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;

  @ManyToOne(() => Soumission, (s) => s.reponses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'soumission_id' })
  soumission!: Soumission;

  @ManyToOne(() => Question, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'question_id' })
  question!: Question;

  /** Getter pratique : décode `option_ids` (TEXT → string[]) */
  get optionIds(): string[] {
    if (!this.optionIdsRaw) return [];
    try {
      const parsed = JSON.parse(this.optionIdsRaw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  /** Setter pratique : encode `option_ids` (string[] → TEXT) */
  set optionIds(value: string[] | null) {
    this.optionIdsRaw = value && value.length ? JSON.stringify(value) : null;
  }
}