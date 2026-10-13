// src/entities/Conversation.entity.ts
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Message } from './Message.entity';

@Entity('conversations')
export class Conversation extends BaseEntity {
  @Column({ type: 'varchar', length: 200, nullable: true })
  titre: string;

  @Column({ type: 'boolean', default: false, name: 'est_groupe' })
  estGroupe: boolean;

  @Column({ type: 'text', nullable: true, name: 'photo_url' })
  photoUrl: string;

  @Column({ type: 'timestamp', nullable: true, name: 'dernier_message_at' })
  dernierMessageAt: Date;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'conversation_membres',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  membres: User[];

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];
}