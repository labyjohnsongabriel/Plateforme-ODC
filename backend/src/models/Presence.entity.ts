import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Session } from './Session.entity';
import { MethodePresence, StatutPresence } from './enums';

@Entity('presences')
@Index(['sessionId', 'participantId'])
@Index(['datePresence'])
@Unique('UQ_presence_session_participant_date', [
  'sessionId',
  'participantId',
  'datePresence',
])
export class Presence extends BaseEntity {
  /* ─── Date & heure ─── */
  @Column({ type: 'date', name: 'date_presence' })
  datePresence: Date;

  @Column({ type: 'time', nullable: true, name: 'heure_scan' })
  heureScan: string | null;

  @Column({ type: 'timestamp', name: 'scanne_le', nullable: true })
  scanneLe: Date | null;

  /* ─── Statut ─── */
  @Column({
    type: 'enum',
    enum: StatutPresence,
    default: StatutPresence.PRESENT,
  })
  statut: StatutPresence;

  @Column({
    type: 'enum',
    enum: MethodePresence,
    default: MethodePresence.MANUEL,
  })
  methode: MethodePresence;

  /* ─── Métadonnées ─── */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'qr_token' })
  qrToken: string | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  /* ─── Relations ─── */
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