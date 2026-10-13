// src/entities/Session.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { StatutSession } from './enums';
import { Formation } from './Formation.entity';
import { User } from './User.entity';
import { Inscription } from './Inscription.entity';
import { Presence } from './Presence.entity';
import { Evaluation } from './Evaluation.entity';
import { Attestation } from './Attestation.entity';
import { Ressource } from './Ressource.entity';

@Entity('sessions')
@Index(['codeSession'], { unique: true })
@Index(['statut'])
@Index(['dateDebut'])
export class Session extends BaseEntity {
  // ==========================================================================
  // 🔑 IDENTIFICATION
  // ==========================================================================
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'code_session',
    default: '',
  })
  codeSession: string;

  // ==========================================================================
  // 📅 DATES
  // ==========================================================================
  @Column({
    type: 'date',
    name: 'date_debut',
    default: () => 'CURRENT_DATE',
  })
  dateDebut: Date;

  @Column({
    type: 'date',
    name: 'date_fin',
    default: () => 'CURRENT_DATE',
  })
  dateFin: Date;

  // ==========================================================================
  // 📍 INFORMATIONS
  // ==========================================================================
  @Column({ type: 'varchar', length: 200, nullable: true })
  lieu: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'lien_visio' })
  lienVisio: string | null;

  @Column({ type: 'int', default: 30 })
  capacite: number;

  @Column({ type: 'varchar', length: 30, default: StatutSession.PLANIFIEE })
  statut: StatutSession;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // ==========================================================================
  // 🖼️ IMAGE
  // ==========================================================================
  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string | null;

  // ==========================================================================
  // 📱 QR CODE PRÉSENCE
  // ==========================================================================
  @Column({ type: 'text', nullable: true, name: 'qr_code_secret' })
  qrCodeSecret: string | null;

  @Column({ type: 'boolean', default: false, name: 'presence_ouverte' })
  presenceOuverte: boolean;

  // ==========================================================================
  // 📝 INSCRIPTIONS
  // ==========================================================================
  @Column({ type: 'timestamp', nullable: true, name: 'date_ouverture_inscriptions' })
  dateOuvertureInscriptions: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'date_fermeture_inscriptions' })
  dateFermetureInscriptions: Date | null;

  // ==========================================================================
  // 📢 PUBLICATION
  // ==========================================================================
  @Column({ type: 'boolean', default: true, name: 'est_publiee' })
  estPubliee: boolean;

  // ==========================================================================
  // 🔗 RELATIONS
  // ==========================================================================
  @ManyToOne(() => Formation, (f) => f.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  // ⚠️ PAS de default: '' sur les UUID — le service DOIT toujours fournir la valeur
  @Column({ type: 'uuid', name: 'formation_id' })
  formationId: string;

  @ManyToOne(() => User, (u) => u.sessionsAnimees, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'formateur_id' })
  formateur: User | null;

  @Column({ type: 'uuid', nullable: true, name: 'formateur_id' })
  formateurId: string | null;

  @OneToMany(() => Inscription, (i) => i.session)
  inscriptions: Inscription[];

  @OneToMany(() => Presence, (p) => p.session)
  presences: Presence[];

  @OneToMany(() => Evaluation, (e) => e.session)
  evaluations: Evaluation[];

  @OneToMany(() => Attestation, (a) => a.session)
  attestations: Attestation[];

  @OneToMany(() => Ressource, (r) => r.session)
  ressources: Ressource[];
}