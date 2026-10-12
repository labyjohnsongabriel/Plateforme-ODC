// src/entities/Presence.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { StatutPresence, MethodePresence } from './enums';
import { User } from './User.entity';
import { Session } from './Session.entity';

/* ============================================================================
   ENTITÉ PRESENCE
   ============================================================================ */

@Entity('presences')
@Unique('UQ_presence_session_participant_date', [
  'sessionId',
  'participantId',
  'datePresence',
])
@Index(['participantId'])
@Index(['sessionId'])
@Index(['datePresence'])
@Index(['statut'])
export class Presence extends BaseEntity {
  /* ==========================================================================
     STATUT ⭐ (PAS de colonne `present`)
     ========================================================================== */

  @Column({
    type: 'varchar',
    length: 20,
    default: StatutPresence.PRESENT,
  })
  statut: StatutPresence;

  /* ==========================================================================
     MÉTHODE
     ========================================================================== */

  @Column({
    type: 'varchar',
    length: 20,
    default: MethodePresence.QR_CODE,
  })
  methode: MethodePresence;

  /* ==========================================================================
     DATES
     ========================================================================== */

  @Column({ type: 'date', name: 'date_presence' })
  datePresence: Date;

  @Column({ type: 'time', nullable: true, name: 'heure_scan' })
  heureScan: string | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'scanne_le',
  })
  scanneLe: Date;

  /* ==========================================================================
     TRAÇABILITÉ
     ========================================================================== */

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'qr_token' })
  qrToken: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  /* ==========================================================================
     RELATIONS
     ========================================================================== */

  @ManyToOne(() => Session, (s) => s.presences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => User, (u) => u.presences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: User;

  @Column({ name: 'participant_id' })
  participantId: string;

  /* ==========================================================================
     ⭐ GETTERS (compatibilité avec l'ancien code qui utilisait `present`)
     ========================================================================== */

  /**
   * Retourne `true` si présent.
   */
  get present(): boolean {
    return this.statut === StatutPresence.PRESENT;
  }

  get absent(): boolean {
    return this.statut === StatutPresence.ABSENT;
  }

  get enRetard(): boolean {
    return this.statut === StatutPresence.RETARD;
  }

  get excuse(): boolean {
    return this.statut === StatutPresence.EXCUSE;
  }

  /* ==========================================================================
     ⭐ MÉTHODES MÉTIER
     ========================================================================== */

  markAsPresent(): void {
    this.statut = StatutPresence.PRESENT;
  }

  markAsAbsent(): void {
    this.statut = StatutPresence.ABSENT;
  }

  markAsLate(): void {
    this.statut = StatutPresence.RETARD;
  }

  markAsExcused(): void {
    this.statut = StatutPresence.EXCUSE;
  }

  /* ==========================================================================
     HOOKS (auto-fill)
     ========================================================================== */

  /**
   * Auto-remplir `datePresence`, `heureScan` et `scanneLe` si absents.
   */
  @BeforeInsert()
  @BeforeUpdate()
  autoFillDates(): void {
    const now = new Date();

    if (!this.datePresence) {
      this.datePresence = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
    }

    if (!this.heureScan) {
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      this.heureScan = `${h}:${m}:${s}`;
    }

    if (!this.scanneLe) {
      this.scanneLe = now;
    }
  }
}