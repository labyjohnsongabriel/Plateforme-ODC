import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Session } from './Session.entity';

export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
  ANNULEE = 'ANNULEE',
}

@Entity('inscriptions')
@Unique(['sessionId', 'participantId'])
@Index(['statut'])
export class Inscription extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 30,
    default: StatutInscription.EN_ATTENTE,
  })
  statut: StatutInscription;

  @Column({ type: 'text', nullable: true, name: 'motif_refus' })
  motifRefus: string;

  @Column({ type: 'text', nullable: true })
  motivation: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'date_inscription' })
  dateInscription: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'date_selection' })
  dateSelection: Date;

  @Column({ type: 'uuid', nullable: true, name: 'selectionne_par' })
  selectionnePar: string;

  // Relations
  @ManyToOne(() => Session, (s) => s.inscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => User, (u) => u.inscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ name: 'participant_id' })
  participantId: string;
}