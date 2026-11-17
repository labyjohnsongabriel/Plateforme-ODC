// src/components/messagerie/MessageBubble.tsx
'use client';

import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../types/messagerie.types';
import { Avatar } from '@/components/common/Avatar';
import { timeAgo } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

export function MessageBubble({
  message,
  isMine,
  showAvatar = true,
  showName = false,
}: MessageBubbleProps) {
  return (
    <div className={cn('group flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {/* Avatar */}
      {!isMine && showAvatar && (
        <div className="w-8 flex-shrink-0">
          <Avatar
            src={message.expediteur?.photoUrl}
            name={`${message.expediteur?.prenom} ${message.expediteur?.nom}`}
            size="sm"
          />
        </div>
      )}

      <div className={cn('flex max-w-[70%] flex-col', isMine ? 'items-end' : 'items-start')}>
        {/* Nom */}
        {showName && !isMine && (
          <span className="mb-1 px-1 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
            {message.expediteur?.prenom}
          </span>
        )}

        {/* Bulle */}
        <div
          className={cn(
            'break-words rounded-2xl px-4 py-2',
            isMine
              ? 'rounded-br-sm bg-gradient-to-br from-orange-500 to-orange-700 text-white'
              : 'rounded-bl-sm bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50',
          )}
        >
          <p className="whitespace-pre-wrap text-sm">{message.contenu}</p>

          {/* Heure + statut */}
          <div
            className={cn(
              'mt-1 flex items-center gap-1',
              isMine ? 'justify-end' : 'justify-start',
            )}
          >
            <span
              className={cn(
                'text-[10px]',
                isMine ? 'text-white/70' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {timeAgo(message.createdAt)}
            </span>
            {isMine && (
              <span className="text-white/70">
                {message.lu ? <CheckCheck size={12} /> : <Check size={12} />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}