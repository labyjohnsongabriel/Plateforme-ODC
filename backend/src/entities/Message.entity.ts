// src/entities/Message.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { TypeMessage } from './enums';
import { Conversation } from './Conversation.entity';
import { User } from './User.entity';

@Entity('messages')
@Index(['conversationId'])
export class Message extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  contenu: string;

  @Column({ type: 'varchar', length: 20, default: TypeMessage.TEXTE })
  type: TypeMessage;

  @Column({ type: 'boolean', default: false })
  lu: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'date_lecture' })
  dateLecture: Date;

  @Column({ type: 'text', nullable: true, name: 'fichier_url' })
  fichierUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'fichier_nom' })
  fichierNom: string;

  @Column({ type: 'int', nullable: true, name: 'fichier_taille' })
  fichierTaille: number;

  // ============ RELATIONS ============
  @ManyToOne(() => Conversation, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => User, (u) => u.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expediteur_id' })
  expediteur: User;

  @Column({ name: 'expediteur_id' })
  expediteurId: string;
}