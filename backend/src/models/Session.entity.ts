import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Formation } from './Formation.entity';
import { User } from './User.entity';
import { Inscription } from './Inscription.entity';
import { Presence } from './Presence.entity';
import { Evaluation } from './Evaluation.entity';
import { Attestation } from './Attestation.entity';
import { Ressource } from './Ressource.entity';

export enum StatutSession {
  OUVERTE = 'OUVERTE',
  FERMEE = 'FERMEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

@Entity('sessions')
@Index(['statut'])
@Index(['dateDebut'])
export class Session extends BaseEntity {
  @Column({ type: 'date', name: 'date_debut' })
  dateDebut: Date;

  @Column({ type: 'date', name: 'date_fin' })
  dateFin: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  lieu: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'lien_visio' })
  lienVisio: string;

  @Column({ type: 'int', default: 30 })
  capacite: number;

  @Column({ type: 'varchar', length: 30, default: StatutSession.OUVERTE })
  statut: StatutSession;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true, name: 'date_ouverture_inscriptions' })
  dateOuvertureInscriptions: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'date_fermeture_inscriptions' })
  dateFermetureInscriptions: Date;

  // ==========================================================================
  // RELATIONS
  // ==========================================================================

  @ManyToOne(() => Formation, (f) => f.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  @Column({ name: 'formation_id' })
  formationId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'formateur_id' })
  formateur: User;

  @Column({ name: 'formateur_id', nullable: true })
  formateurId: string;

  @OneToMany(() => Inscription, (i) => i.session)
  inscriptions: Inscription[];

  @OneToMany(() => Presence, (p) => p.session)
  presences: Presence[];

  @OneToMany(() => Evaluation, (e) => e.session)
  evaluations: Evaluation[];

  // ⚠️ LA LIGNE QUI MANQUAIT PROBABLEMENT
  @OneToMany(() => Attestation, (a) => a.session)
  attestations: Attestation[];

  @OneToMany(() => Ressource, (r) => r.session)
  ressources: Ressource[];
}