import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Session } from './Session.entity';
import { Domaine } from './Domaine.entity';

export enum NiveauFormation {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

@Entity('formations')
@Index(['domaine'])
@Index(['actif'])
export class Formation extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  domaine: string;

  @Column({ type: 'int', name: 'duree_heures' })
  dureeHeures: number;

  @Column({ type: 'varchar', length: 50 })
  niveau: NiveauFormation;

  @Column({ type: 'text', nullable: true })
  prerequis: string;

  @Column({ type: 'text', nullable: true })
  objectifs: string;

  @Column({ type: 'text', nullable: true })
  programme: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prix: number;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'int', default: 0, name: 'nb_participants_max' })
  nbParticipantsMax: number;

  @ManyToOne(() => Domaine, (d) => d.formations, { nullable: true })
  @JoinColumn({ name: 'domaine_id' })
  domaineRelation: Domaine;

  @Column({ name: 'domaine_id', nullable: true })
  domaineId: string;

  @OneToMany(() => Session, (s) => s.formation)
  sessions: Session[];
}