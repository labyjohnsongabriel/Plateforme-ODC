import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';

export enum StatutConnection {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
}

@Entity('connections')
@Unique(['expediteurId', 'destinataireId'])
export class Connection extends BaseEntity {
  @Column({ type: 'varchar', length: 20, default: StatutConnection.EN_ATTENTE })
  statut: StatutConnection;

  @Column({ type: 'text', nullable: true })
  message: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expediteur_id' })
  expediteur: User;

  @Column({ name: 'expediteur_id' })
  expediteurId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destinataire_id' })
  destinataire: User;

  @Column({ name: 'destinataire_id' })
  destinataireId: string;
}