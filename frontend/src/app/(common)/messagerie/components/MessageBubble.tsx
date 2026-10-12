'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { formatTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface Props {
  message: any;
  isMine: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isMine, showAvatar }: Props) {
  return (
    <div
      className={cn(
        'flex items-end gap-2 max-w-[80%]',
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      {showAvatar && !isMine && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.expediteur?.photoUrl ?? undefined} />
          <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-[10px] font-medium">
            {getInitials(
              message.expediteur?.nom ?? '',
              message.expediteur?.prenom ?? '',
            )}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}>
        {showAvatar && !isMine && (
          <p className="text-[10px] text-odc-muted mb-1 px-1">
            {message.expediteur?.prenom} {message.expediteur?.nom}
          </p>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm max-w-full break-words',
            isMine
              ? 'bg-odc-primary text-white rounded-br-sm'
              : 'bg-odc-surface-alt text-odc-text-primary rounded-bl-sm',
          )}
        >
          {message.contenu}
        </div>

        <p className="text-[10px] text-odc-muted mt-1 px-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}