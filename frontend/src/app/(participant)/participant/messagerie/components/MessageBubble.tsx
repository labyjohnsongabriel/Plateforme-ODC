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
        'flex max-w-[80%] items-end gap-2',
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto',
        compact ? 'mt-0.5' : 'mt-3',
      )}
    >
      {/* Avatar (groupe uniquement, côté autre) */}
      {showAvatar && !isMine && (
        <div className="w-8 shrink-0">
          {!compact ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.expediteur?.photoUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                {getInitials(
                  message.expediteur?.nom ?? '',
                  message.expediteur?.prenom ?? '',
                )}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8" aria-hidden />
          )}
        </div>
      )}

      <div
        className={cn(
          'flex min-w-0 flex-col',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {/* Nom expéditeur (groupe, première bulle) */}
        {showAvatar && !isMine && !compact && (
          <p className="mb-1 px-1 text-[10px] font-medium text-muted-foreground">
            {message.expediteur?.prenom} {message.expediteur?.nom}
          </p>
        )}

        {/* Bulle */}
        <div
          className={cn(
            'max-w-full break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm',
            isMine
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md bg-muted text-foreground',
            compact && (isMine ? 'rounded-tr-md' : 'rounded-tl-md'),
          )}
        >
          {message.contenu}
        </div>

        {/* Timestamp + statut */}
        <div
          className={cn(
            'mt-1 flex items-center gap-1 px-1',
            isMine && 'flex-row-reverse',
          )}
        >
          <p className="text-[10px] tabular-nums text-muted-foreground">
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