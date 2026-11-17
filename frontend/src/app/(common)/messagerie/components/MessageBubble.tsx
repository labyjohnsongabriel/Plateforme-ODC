// src/app/(participant)/participant/messagerie/components/MessageBubble.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCheck } from 'lucide-react';
import { getInitials, cn } from '@/lib/utils';
import { formatTime } from '@/lib/formatters';

interface Props {
  message: any;
  isMine: boolean;
  showAvatar?: boolean;
  compact?: boolean;
}

export function MessageBubble({
  message,
  isMine,
  showAvatar,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        'flex items-end gap-2 max-w-[80%]',
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto',
        compact ? 'mt-0.5' : 'mt-3',
      )}
    >
      {/* Avatar (groupe uniquement) */}
      {showAvatar && !isMine && (
        <div className={compact ? 'w-8 shrink-0' : 'w-8 shrink-0'}>
          {!compact ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.expediteur?.photoUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                {getInitials(
                  message.expediteur?.nom ?? '',
                  message.expediteur?.prenom ?? '',
                )}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
      )}

      <div
        className={cn(
          'flex flex-col min-w-0',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {/* Nom expéditeur (groupe, première bulle) */}
        {showAvatar && !isMine && !compact && (
          <p className="text-[10px] font-medium text-muted-foreground mb-1 px-1">
            {message.expediteur?.prenom} {message.expediteur?.nom}
          </p>
        )}

        {/* Bulle */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm max-w-full break-words shadow-sm',
            isMine
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md',
            compact && (isMine ? 'rounded-tr-md' : 'rounded-tl-md'),
          )}
        >
          {message.contenu}
        </div>

        {/* Timestamp + statut */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 px-1',
            isMine && 'flex-row-reverse',
          )}
        >
          <p className="text-[10px] text-muted-foreground tabular-nums">
            {formatTime(message.createdAt)}
          </p>
          {isMine && (
            <CheckCheck
              className="h-3 w-3 text-primary/60"
              aria-label="Message envoyé"
            />
          )}
        </div>
      </div>
    </div>
  );
}