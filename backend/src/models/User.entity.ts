import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role.entity';
import { Inscription } from './Inscription.entity';
import { Presence } from './Presence.entity';
import { Note } from './Note.entity';
import { Attestation } from './Attestation.entity';
import { Notification } from './Notification.entity';
import { Message } from './Message.entity';

@Entity('users')
@Index(['email'])
@Index(['roleId'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  prenom: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, name: 'mot_de_passe' })
  motDePasse: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telephone: string;

  @Column({ type: 'text', nullable: true, name: 'photo_url' })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  ville: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  linkedin: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  entreprise: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  poste: string;

  @Column({ type: 'simple-array', nullable: true })
  competences: string[];

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'boolean', default: false, name: 'email_verifie' })
  emailVerifie: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, select: false, name: 'reset_token' })
  resetToken: string;

  @Column({ type: 'timestamp', nullable: true, select: false, name: 'reset_token_expires' })
  resetTokenExpires: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'derniere_connexion' })
  derniereConnexion: Date;

  @ManyToOne(() => Role, (role) => role.users, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: string;

  @OneToMany(() => Inscription, (i) => i.participant)
  inscriptions: Inscription[];

  @OneToMany(() => Presence, (p) => p.participant)
  presences: Presence[];

  @OneToMany(() => Note, (n) => n.participant)
  notes: Note[];

  @OneToMany(() => Attestation, (a) => a.participant)
  attestations: Attestation[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToMany(() => Message, (m) => m.expediteur)
  messages: Message[];
}