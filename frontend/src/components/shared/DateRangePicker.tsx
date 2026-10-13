// src/components/shared/DateRangePicker.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: 'start' | 'center' | 'end';
  numberOfMonths?: number;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Sélectionner une période',
  disabled,
  className,
  align = 'start',
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [internal, setInternal] = React.useState<DateRange | undefined>(value);
  const range = value ?? internal;
  const hasValue = !!range?.from;

  const handleChange = (r: DateRange | undefined) => {
    if (value === undefined) setInternal(r);
    onChange?.(r);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !hasValue && 'text-odc-muted',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1 truncate">
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, 'dd MMM yyyy', { locale: fr })} —{' '}
                  {format(range.to, 'dd MMM yyyy', { locale: fr })}
                </>
              ) : (
                format(range.from, 'dd MMM yyyy', { locale: fr })
              )
            ) : (
              placeholder
            )}
          </span>
          {hasValue && (
            <button
              onClick={clear}
              className="ml-1 rounded-full hover:bg-odc-surface-alt p-0.5"
              aria-label="Effacer la période"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleChange}
          numberOfMonths={numberOfMonths}
          initialFocus
          locale={fr}
        />
      </PopoverContent>
    </Popover>
  );
}