// src/entities/Presence.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { StatutPresence, MethodePresence } from './enums';
import { User } from './User.entity';
import { Session } from './Session.entity';

@Entity('presences')
@Unique(['sessionId', 'participantId', 'datePresence'])
@Index(['participantId'])
export class Presence extends BaseEntity {
  @Column({ type: 'varchar', length: 20, default: StatutPresence.PRESENT })
  statut: StatutPresence;

  @Column({ type: 'varchar', length: 20, default: MethodePresence.QR_CODE })
  methode: MethodePresence;

  @Column({ type: 'date', name: 'date_presence' })
  datePresence: Date;

  @Column({ type: 'time', nullable: true, name: 'heure_scan' })
  heureScan: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'scanne_le' })
  scanneLe: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'qr_token' })
  qrToken: string;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  // ============ RELATIONS ============
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
}