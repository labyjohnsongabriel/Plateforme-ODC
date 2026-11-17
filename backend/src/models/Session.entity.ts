// src/entities/Session.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
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
  /* ════════════════════════════════════════════════════════════════════════
     INFORMATIONS DE BASE
     ════════════════════════════════════════════════════════════════════════ */

  @Column({ type: 'date', name: 'date_debut' })
  dateDebut: Date;

  @Column({ type: 'date', name: 'date_fin' })
  dateFin: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  lieu: string | null;
  @Column({
  type: 'varchar',
  length: 50,
  unique: true,
  name: 'code_session',
  default: () => `'SESS-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6))`,
})
codeSession: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'lien_visio' })
  lienVisio: string | null;

  @Column({ type: 'int', default: 30 })
  capacite: number;

  @Column({
    type: 'varchar',
    length: 30,
    default: StatutSession.OUVERTE,
  })
  statut: StatutSession;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'date_ouverture_inscriptions',
  })
  dateOuvertureInscriptions: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'date_fermeture_inscriptions',
  })
  dateFermetureInscriptions: Date | null;

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ QR CODE & PRÉSENCES
     ════════════════════════════════════════════════════════════════════════ */

  @Column({ type: 'boolean', default: false, name: 'presence_ouverte' })
  presenceOuverte: boolean;

  @Column({ type: 'text', nullable: true, name: 'qr_code_secret' })
  qrCodeSecret: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'qr_code_expires_at',
  })
  qrCodeExpiresAt: Date | null;

  /* ════════════════════════════════════════════════════════════════════════
     RELATIONS
     ════════════════════════════════════════════════════════════════════════ */

  @ManyToOne(() => Formation, (f) => f.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  @Column({ name: 'formation_id' })
  formationId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'formateur_id' })
  formateur: User | null;

  @Column({ name: 'formateur_id', nullable: true })
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