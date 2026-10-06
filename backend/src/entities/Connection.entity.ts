// src/entities/Connection.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { StatutConnection } from './enums';
import { User } from './User.entity';

@Entity('connections')
@Unique(['expediteurId', 'destinataireId'])
@Index(['statut'])
export class Connection extends BaseEntity {
  @Column({ type: 'varchar', length: 20, default: StatutConnection.EN_ATTENTE })
  statut: StatutConnection;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'timestamp', nullable: true, name: 'date_reponse' })
  dateReponse: Date;

  // ============ RELATIONS ============
  @ManyToOne(() => User, (u) => u.connectionsEnvoyees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expediteur_id' })
  expediteur: User;

  @Column({ name: 'expediteur_id' })
  expediteurId: string;

  @ManyToOne(() => User, (u) => u.connectionsRecues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destinataire_id' })
  destinataire: User;

  @Column({ name: 'destinataire_id' })
  destinataireId: string;
}