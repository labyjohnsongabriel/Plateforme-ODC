import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Session } from './Session.entity';
import { User } from './User.entity';

export enum TypeRessource {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  LIEN = 'LIEN',
  DOCUMENT = 'DOCUMENT',
  PRESENTATION = 'PRESENTATION',
  AUTRE = 'AUTRE',
}

@Entity('ressources')
@Index(['sessionId'])
export class Ressource extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  type: TypeRessource;

  @Column({ type: 'text', name: 'fichier_url' })
  fichierUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'fichier_nom' })
  fichierNom: string;

  @Column({ type: 'int', nullable: true, name: 'fichier_taille' })
  fichierTaille: number;

  @Column({ type: 'boolean', default: true, name: 'visible_participants' })
  visibleParticipants: boolean;

  @Column({ type: 'int', default: 0, name: 'ordre_affichage' })
  ordreAffichage: number;

  @Column({ type: 'int', default: 0, name: 'nb_telechargements' })
  nbTelechargements: number;

  // Relations
  @ManyToOne(() => Session, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploade_par' })
  uploadeParUser: User;

  @Column({ name: 'uploade_par', nullable: true })
  uploadePar: string;
}