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
        'w-full p-3 text-left flex items-center gap-3 transition-colors',
        'border-b border-odc-border-light dark:border-odc-border-dark',
        isSelected
          ? 'bg-odc-primary-soft dark:bg-odc-primary-soft/20'
          : 'hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark'
      )}
    >
      {/* Avatar */}
      {avatar.isGroup ? (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white flex-shrink-0">
          <Users size={18} />
        </div>
      ) : (
        <Avatar src={avatar.photoUrl} name={avatar.name} size="md" status="online" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              'font-medium text-sm truncate',
              nonLus > 0
                ? 'text-odc-text-light dark:text-odc-text-dark font-semibold'
                : 'text-odc-text-light dark:text-odc-text-dark'
            )}
          >
            {displayName}
          </div>
          {lastMessage && (
            <span className="text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark flex-shrink-0">
              {timeAgo(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {isMine && lastMessage && (
              <span className="text-odc-primary flex-shrink-0">
                {lastMessage.lu ? <CheckCheck size={12} /> : <Check size={12} />}
              </span>
            )}
            <div
              className={cn(
                'text-xs truncate',
                nonLus > 0
                  ? 'text-odc-text-light dark:text-odc-text-dark font-medium'
                  : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
              )}
            >
              {MessagerieService.formatLastMessage(conversation)}
            </div>
          </div>

          {nonLus > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-odc-primary text-white text-[10px] font-bold flex items-center justify-center">
              {nonLus > 99 ? '99+' : nonLus}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}