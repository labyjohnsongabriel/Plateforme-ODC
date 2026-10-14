// src/entities/Attestation.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Session } from './Session.entity';

@Entity('attestations')
@Index(['numero'], { unique: true })
@Index(['hash'], { unique: true })
@Index(['participantId', 'sessionId'], { unique: true })
@Index(['valide'])
@Index(['dateEmission'])
export class Attestation extends BaseEntity {
  /* ==========================================================================
     IDENTIFIANTS
     ========================================================================== */

  @Column({ type: 'varchar', length: 50, unique: true })
  numero: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  hash: string;

  /* ==========================================================================
     FICHIERS & QR
     ========================================================================== */

  @Column({ type: 'text', nullable: true, name: 'fichier_url' })
  fichierUrl: string | null;

  @Column({ type: 'text', nullable: true, name: 'qr_code_url' })
  qrCodeUrl: string | null;

  /* ==========================================================================
     DONNÉES PÉDAGOGIQUES
     ========================================================================== */

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'note_finale',
  })
  noteFinale: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'taux_presence',
  })
  tauxPresence: number | null;

  /* ==========================================================================
     SUIVI DE TÉLÉCHARGEMENT
     ========================================================================== */

  @Column({ type: 'boolean', default: false })
  telechargee: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'date_telechargement' })
  dateTelechargement: Date | null;

  /* ==========================================================================
     ÉMISSION & VALIDITÉ
     ========================================================================== */

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'date_emission',
  })
  dateEmission: Date;

  @Column({ type: 'text', nullable: true, name: 'signature_numerique' })
  signatureNumerique: string | null;

  @Column({ type: 'boolean', default: true })
  valide: boolean;

  @Column({ type: 'text', nullable: true, name: 'motif_invalidation' })
  motifInvalidation: string | null;

  /* ==========================================================================
     ⚠️ RELATIONS — PAS de `eager: true` pour éviter le bug TypeORM
     ========================================================================== */

  @ManyToOne(() => Session, (s) => s.attestations, {
    onDelete: 'CASCADE',
    eager: false, // ⭐ NE PAS mettre `eager: true`
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => User, (u) => u.attestations, {
    onDelete: 'CASCADE',
    eager: false, // ⭐ NE PAS mettre `eager: true`
  })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ name: 'participant_id', type: 'uuid' })
  participantId: string;
}