'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
  placeholder?: string;
  /** Callback quand l'utilisateur tape (debounced) */
  onSearch?: (query: string) => void;
  /** Callback quand Entrée est pressée */
  onEnter?: (query: string) => void;
  className?: string;
}

export function HeaderSearch({
  placeholder = 'Rechercher…',
  onSearch,
  onEnter,
  className,
}: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Raccourci ⌘K / Ctrl+K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  /* Debounce */
  useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const clear = () => {
    setValue('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'relative w-full max-w-md transition-all duration-200',
        focused && 'max-w-lg',
        className,
      )}
    >
      <Search
        className={cn(
          'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
          focused ? 'text-odc-primary' : 'text-odc-text-muted',
        )}
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter?.(value);
          if (e.key === 'Escape') inputRef.current?.blur();
        }}
        placeholder={placeholder}
        className="input-odc h-9 pl-9 pr-20"
        aria-label="Rechercher"
      />

      {/* Raccourci clavier ou bouton effacer */}
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="flex h-6 w-6 items-center justify-center rounded text-odc-text-muted transition-colors hover:bg-odc-surface-alt hover:text-odc-text-primary"
            aria-label="Effacer la recherche"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd
            className="hidden h-5 items-center gap-0.5 rounded border border-odc-border bg-odc-surface-alt px-1.5 font-mono text-[10px] font-medium text-odc-text-muted sm:inline-flex"
            aria-hidden
          >
            <span className="text-[11px]">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
}