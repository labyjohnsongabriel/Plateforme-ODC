// src/entities/Notification.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { TypeNotification } from './enums';
import { User } from './User.entity';

@Entity('notifications')
@Index(['userId'])
@Index(['lue'])
export class Notification extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  titre: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 20, default: TypeNotification.INFO })
  type: TypeNotification;

  @Column({ type: 'boolean', default: false })
  lue: boolean;

  @Column({ type: 'varchar', length: 300, nullable: true })
  lien: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icone: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'timestamp', nullable: true, name: 'date_lecture' })
  dateLecture: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'expire_at' })
  expireAt: Date;

  @ManyToOne(() => User, (u) => u.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}