// src/components/shared/ThemeToggle.tsx
'use client';

import * as React from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getStoredTheme, setTheme, type ThemeMode } from '@/lib/theme';
import { cn } from '@/lib/utils';

const MODES: Array<{
  value: ThemeMode;
  label: string;
  icon: React.ElementType;
}> = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
];

export function ThemeToggle() {
  const [mode, setMode] = React.useState<ThemeMode>('system');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setMode(getStoredTheme());
  }, []);

  const handleChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setTheme(newMode);
  };

  const Icon = mounted
    ? mode === 'dark'
      ? Moon
      : mode === 'light'
        ? Sun
        : Monitor
    : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Changer de thème"
        >
          <Icon className="h-5 w-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      >
        {MODES.map(({ value, label, icon: ItemIcon }) => {
          const active = mounted && mode === value;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => handleChange(value)}
              className={cn(
                'cursor-pointer rounded-md px-2 py-2 text-sm font-medium',
                'focus:bg-orange-50 focus:text-orange-700 dark:focus:bg-orange-500/10 dark:focus:text-orange-300',
                active
                  ? 'text-orange-700 dark:text-orange-300'
                  : 'text-slate-600 dark:text-slate-400',
              )}
            >
              <ItemIcon
                className={cn(
                  'mr-2 h-4 w-4',
                  active
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-400 dark:text-slate-500',
                )}
                aria-hidden
              />
              <span className="flex-1">{label}</span>
              {active && (
                <Check
                  className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400"
                  aria-hidden
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}