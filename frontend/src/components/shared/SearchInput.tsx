// src/components/shared/SearchInput.tsx
'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceDelay?: number;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value: controlledValue,
  onChange,
  onDebouncedChange,
  debounceDelay = 300,
  placeholder = 'Rechercher…',
  loading,
  disabled,
  className,
  autoFocus,
}: SearchInputProps) {
  const [internal, setInternal] = React.useState(controlledValue ?? '');
  const value = controlledValue ?? internal;
  const debounced = useDebounce(value, debounceDelay);

  React.useEffect(() => {
    onDebouncedChange?.(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const handleChange = (v: string) => {
    if (controlledValue === undefined) setInternal(v);
    onChange?.(v);
  };

  const clear = () => handleChange('');

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-odc-muted pointer-events-none" />

      <Input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="pl-9 pr-10"
        aria-label={placeholder}
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-odc-muted" />}
        {!loading && value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            className="h-7 w-7"
            aria-label="Effacer la recherche"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}