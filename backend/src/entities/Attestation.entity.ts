// src/entities/Attestation.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Session } from './Session.entity';

@Entity('attestations')
@Index(['numero'], { unique: true })
@Index(['hash'], { unique: true })
export class Attestation extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  numero: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  hash: string;

  @Column({ type: 'text', nullable: true, name: 'fichier_url' })
  fichierUrl: string;

  @Column({ type: 'text', nullable: true, name: 'qr_code_url' })
  qrCodeUrl: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'note_finale' })
  noteFinale: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'taux_presence' })
  tauxPresence: number;

  @Column({ type: 'boolean', default: false })
  telechargee: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'date_telechargement' })
  dateTelechargement: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'date_emission' })
  dateEmission: Date;

  @Column({ type: 'text', nullable: true, name: 'signature_numerique' })
  signatureNumerique: string;

  @Column({ type: 'boolean', default: true })
  valide: boolean;

  // ============ RELATIONS ============
  @ManyToOne(() => Session, (s) => s.attestations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => User, (u) => u.attestations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ name: 'participant_id' })
  participantId: string;
}