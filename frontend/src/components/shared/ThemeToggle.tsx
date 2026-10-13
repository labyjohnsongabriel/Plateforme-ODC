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
          className="h-9 w-9"
          aria-label="Changer de thème"
        >
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {MODES.map(({ value, label, icon: ItemIcon }) => {
          const active = mounted && mode === value;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => handleChange(value)}
              className="cursor-pointer"
            >
              <ItemIcon className="h-4 w-4 mr-2" />
              <span className="flex-1">{label}</span>
              {active && <Check className="h-3.5 w-3.5 text-odc-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}