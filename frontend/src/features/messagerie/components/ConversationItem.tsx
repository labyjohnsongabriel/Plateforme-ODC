// src/components/messagerie/ConversationItem.tsx
'use client';

import { Users, Check, CheckCheck } from 'lucide-react';
import { Conversation } from '../types/messagerie.types';
import { Avatar } from '@/components/common/Avatar';
import { MessagerieService } from '../services/messagerie.service';
import { timeAgo } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const displayName = MessagerieService.getDisplayName(conversation, currentUserId);
  const avatar = MessagerieService.getAvatar(conversation, currentUserId);
  const lastMessage = conversation.dernierMessage || conversation.messages?.[0];
  const nonLus = MessagerieService.countNonLusInConversation(conversation, currentUserId);

  const isMine = lastMessage?.expediteurId === currentUserId;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-b border-slate-200 p-3 text-left transition-colors',
        'dark:border-slate-800',
        isSelected
          ? 'bg-orange-50 dark:bg-orange-500/10'
          : 'hover:bg-slate-50 dark:hover:bg-slate-900',
      )}
    >
      {/* Avatar */}
      {avatar.isGroup ? (
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white">
          <Users size={18} />
        </div>
      ) : (
        <Avatar src={avatar.photoUrl} name={avatar.name} size="md" status="online" />
      )}

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              'truncate text-sm',
              nonLus > 0
                ? 'font-semibold text-slate-900 dark:text-slate-50'
                : 'text-slate-900 dark:text-slate-50',
            )}
          >
            {displayName}
          </div>
          {lastMessage && (
            <span className="flex-shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
              {timeAgo(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {isMine && lastMessage && (
              <span className="flex-shrink-0 text-orange-600 dark:text-orange-400">
                {lastMessage.lu ? <CheckCheck size={12} /> : <Check size={12} />}
              </span>
            )}
            <div
              className={cn(
                'truncate text-xs',
                nonLus > 0
                  ? 'font-medium text-slate-900 dark:text-slate-50'
                  : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {MessagerieService.formatLastMessage(conversation)}
            </div>
          </div>

          {nonLus > 0 && (
            <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
              {nonLus > 99 ? '99+' : nonLus}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}