interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-white dark:bg-odc-surface-alt-dark rounded-full px-3 py-2 shadow-sm">
        <div className="flex gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-odc-primary animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-odc-primary animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-odc-primary animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
      <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
        {users.length === 1
          ? `${users[0]} écrit...`
          : `${users.length} personnes écrivent...`}
      </span>
    </div>
  );
}