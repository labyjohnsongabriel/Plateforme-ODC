// src/components/messagerie/ChatWindow.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, Users, Info, Search } from 'lucide-react';
import { Conversation } from '../types/messagerie.types';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/common/Dropdown';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useMessages } from '../hooks/useMessages';
import { MessagerieService } from '../services/messagerie.service';
import { cn } from '@/utils/cn';

interface ChatWindowProps {
  conversation?: Conversation;
  currentUserId: string;
  onBack?: () => void;
}

export function ChatWindow({ conversation, currentUserId, onBack }: ChatWindowProps) {
  const { messages, loading, sendMessage, messagesEndRef } = useMessages(conversation?.id);
  const [typingUsers] = useState<string[]>([]);

  /* ── Pas de conversation ────────────────────────────── */
  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <EmptyState
          icon={<Users size={64} />}
          title="Sélectionnez une conversation"
          description="Choisissez une conversation pour commencer à discuter"
        />
      </div>
    );
  }

  const displayName = MessagerieService.getDisplayName(conversation, currentUserId);
  const avatar = MessagerieService.getAvatar(conversation, currentUserId);

  /* ── Groupage par jour ──────────────────────────────── */
  const groupedMessages: Array<{ date: string; messages: typeof messages }> = [];
  let currentDate = '';

  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [] });
    }
    groupedMessages[groupedMessages.length - 1].messages.push(msg);
  });

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      {/* ═══════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════ */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-lg p-2 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 lg:hidden"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {avatar.isGroup ? (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white">
            <Users size={18} />
          </div>
        ) : (
          <Avatar src={avatar.photoUrl} name={avatar.name} size="md" status="online" />
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-sm font-semibold text-slate-900 dark:text-slate-50">
            {displayName}
          </h3>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            {typingUsers.length > 0
              ? "En train d'écrire..."
              : avatar.isGroup
                ? `${conversation.membres.length} membres`
                : 'En ligne'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton icon={<Phone size={16} />} variant="ghost" size="sm" tooltip="Appel" />
          <IconButton icon={<Video size={16} />} variant="ghost" size="sm" tooltip="Vidéo" />
          <IconButton icon={<Search size={16} />} variant="ghost" size="sm" tooltip="Rechercher" />
          <Dropdown
            trigger={
              <IconButton icon={<MoreVertical size={16} />} variant="ghost" size="sm" />
            }
          >
            <DropdownItem icon={<Info size={14} />}>Voir les détails</DropdownItem>
            <DropdownItem icon={<Users size={14} />}>Voir les membres</DropdownItem>
            <DropdownDivider />
            <DropdownItem danger>Bloquer</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MESSAGES
          ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <Loader />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<Users size={40} />}
            title="Aucun message"
            description="Envoyez le premier message pour démarrer la conversation"
          />
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group, idx) => (
              <div key={idx}>
                {/* Séparateur de date */}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {group.date}
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Messages */}
                <div className="space-y-2">
                  {group.messages.map((msg, msgIdx) => {
                    const isMine = msg.expediteurId === currentUserId;
                    const prevMsg = group.messages[msgIdx - 1];
                    const showAvatar =
                      msgIdx === 0 || prevMsg?.expediteurId !== msg.expediteurId;
                    const showName = conversation.estGroupe && showAvatar;

                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMine={isMine}
                        showAvatar={showAvatar}
                        showName={showName}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          TYPING
          ═══════════════════════════════════════════════════ */}
      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

      {/* ═══════════════════════════════════════════════════
          INPUT
          ═══════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <MessageInput onSend={async (msg) => { await sendMessage(msg); }} />
      </div>
    </div>
  );
}