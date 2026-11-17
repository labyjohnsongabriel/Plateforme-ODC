// src/components/messagerie/TypingIndicator.tsx
'use client';

interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm dark:bg-slate-800">
        <div className="flex gap-1">
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {users.length === 1
          ? `${users[0]} écrit...`
          : `${users.length} personnes écrivent...`}
      </span>
    </div>
  );
}