import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MessageInputProps {
  onSend: (message: string) => Promise<void> | void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  placeholder = 'Écrire un message...',
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    const content = message;
    setMessage('');

    try {
      await onSend(content);
      onStopTyping?.();
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);

    // Typing indicator
    if (onTyping) {
      onTyping();

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 2000);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          rows={1}
          className={cn(
            'w-full px-4 py-2.5 pr-20 rounded-xl resize-none max-h-32',
            'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark',
            'text-odc-text-light dark:text-odc-text-dark',
            'placeholder:text-odc-text-muted-light dark:placeholder:text-odc-text-muted-dark',
            'border border-transparent focus:border-odc-primary',
            'focus:ring-4 focus:ring-odc-primary/10 focus:outline-none',
            'transition-all'
          )}
          style={{ minHeight: '44px' }}
        />

        {/* Actions */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 text-odc-text-muted-light dark:text-odc-text-muted-dark transition-colors"
            title="Joindre un fichier"
          >
            <Paperclip size={16} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 text-odc-text-muted-light dark:text-odc-text-muted-dark transition-colors"
            title="Emoji"
          >
            <Smile size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim() || sending || disabled}
        className={cn(
          'p-3 rounded-xl transition-all flex-shrink-0',
          'bg-gradient-to-br from-odc-primary to-odc-primary-dark text-white',
          'hover:shadow-odc-md active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
        )}
      >
        <Send size={18} />
      </button>
    </div>
  );
}