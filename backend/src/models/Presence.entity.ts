import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Session } from './Session.entity';

@Entity('presences')
@Index(['sessionId', 'participantId'])
@Index(['datePresence'])
export class Presence extends BaseEntity {
  @Column({ type: 'date', name: 'date_presence' })
  datePresence: Date;

  @Column({ type: 'time', nullable: true, name: 'heure_scan' })
  heureScan: string;

  @Column({ type: 'boolean', default: true })
  present: boolean;

  @Column({ type: 'boolean', default: false, name: 'justifiee' })
  justifiee: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'qr_token' })
  qrToken: string;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  // Relations
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