// src/entities/AuditLog.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entite: string;

  @Column({ type: 'uuid', nullable: true, name: 'entite_id' })
  entiteId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}