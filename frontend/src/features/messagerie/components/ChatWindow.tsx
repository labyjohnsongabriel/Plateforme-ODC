import { useState, useEffect } from 'react';
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
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // ========================================================================
  // Pas de conversation
  // ========================================================================
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-odc-bg-light dark:bg-odc-bg-dark">
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

  // ========================================================================
  // Render messages groupés par jour
  // ========================================================================
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
    <div className="flex flex-col h-full bg-odc-bg-light dark:bg-odc-bg-dark">
      {/* ====================================================================
          HEADER
          ==================================================================== */}
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-odc-surface-dark border-b border-odc-border-light dark:border-odc-border-dark flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 rounded-lg hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {avatar.isGroup ? (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white flex-shrink-0">
            <Users size={18} />
          </div>
        ) : (
          <Avatar src={avatar.photoUrl} name={avatar.name} size="md" status="online" />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-sm text-odc-text-light dark:text-odc-text-dark truncate">
            {displayName}
          </h3>
          <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
            {typingUsers.length > 0
              ? 'En train d\'écrire...'
              : avatar.isGroup
              ? `${conversation.membres.length} membres`
              : 'En ligne'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={<Phone size={16} />}
            variant="ghost"
            size="sm"
            tooltip="Appel"
          />
          <IconButton
            icon={<Video size={16} />}
            variant="ghost"
            size="sm"
            tooltip="Vidéo"
          />
          <IconButton
            icon={<Search size={16} />}
            variant="ghost"
            size="sm"
            tooltip="Rechercher"
          />
          <Dropdown
            trigger={
              <IconButton
                icon={<MoreVertical size={16} />}
                variant="ghost"
                size="sm"
              />
            }
          >
            <DropdownItem icon={<Info size={14} />}>Voir les détails</DropdownItem>
            <DropdownItem icon={<Users size={14} />}>Voir les membres</DropdownItem>
            <DropdownDivider />
            <DropdownItem danger>Bloquer</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* ====================================================================
          MESSAGES
          ==================================================================== */}
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
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-odc-border-light dark:bg-odc-border-dark" />
                  <span className="text-[10px] font-semibold text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-odc-border-light dark:bg-odc-border-dark" />
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

      {/* ====================================================================
          TYPING INDICATOR
          ==================================================================== */}
      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

      {/* ====================================================================
          INPUT
          ==================================================================== */}
      <div className="p-3 bg-white dark:bg-odc-surface-dark border-t border-odc-border-light dark:border-odc-border-dark flex-shrink-0">
        <MessageInput onSend={async (msg) => { await sendMessage(msg); }} />
      </div>
    </div>
  );
}