// src/components/messagerie/MessageInput.tsx
'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
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

    if (onTyping) {
      onTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onStopTyping?.(), 2000);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          rows={1}
          className={cn(
            'w-full max-h-32 resize-none rounded-xl px-4 py-2.5 pr-20',
            'bg-slate-100 text-slate-900 placeholder:text-slate-500',
            'dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-400',
            'border border-transparent focus:border-orange-400',
            'focus:outline-none focus:ring-4 focus:ring-orange-400/10',
            'transition-all',
          )}
          style={{ minHeight: '44px' }}
        />

        {/* Actions */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
            title="Joindre un fichier"
          >
            <Paperclip size={16} />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
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
          'flex-shrink-0 rounded-xl p-3 transition-all',
          'bg-gradient-to-br from-orange-500 to-orange-700 text-white',
          'hover:shadow-md active:scale-95',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none',
        )}
        aria-label="Envoyer"
      >
        <Send size={18} />
      </button>
    </div>
  );
}