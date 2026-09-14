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
    <div className={cn('flex gap-2 group', isMine ? 'justify-end' : 'justify-start')}>
      {/* Avatar */}
      {!isMine && showAvatar && (
        <div className="flex-shrink-0 w-8">
          <Avatar
            src={message.expediteur?.photoUrl}
            name={`${message.expediteur?.prenom} ${message.expediteur?.nom}`}
            size="sm"
          />
        </div>
      )}

      <div className={cn('max-w-[70%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
        {/* Name */}
        {showName && !isMine && (
          <span className="text-[10px] font-semibold text-odc-primary mb-1 px-1">
            {message.expediteur?.prenom}
          </span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words',
            isMine
              ? 'bg-gradient-to-br from-odc-primary to-odc-primary-dark text-white rounded-br-sm'
              : 'bg-white dark:bg-odc-surface-alt-dark text-odc-text-light dark:text-odc-text-dark rounded-bl-sm shadow-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.contenu}</p>

          {/* Time + status */}
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              isMine ? 'justify-end' : 'justify-start'
            )}
          >
            <span
              className={cn(
                'text-[10px]',
                isMine ? 'text-white/70' : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
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