// src/components/ui/calendar.tsx
'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium text-slate-900 dark:text-slate-50',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'secondary', size: 'icon-sm' }),
          'opacity-60 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-slate-500 dark:text-slate-400 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-slate-700 dark:text-slate-300',
        ),
        day_selected:
          'bg-orange-500 text-white hover:bg-orange-600 focus:bg-orange-600',
        day_today: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
        day_outside: 'text-slate-400 dark:text-slate-600 opacity-50',
        day_disabled: 'text-slate-300 dark:text-slate-700 opacity-50',
        day_range_middle: 'aria-selected:bg-orange-50 aria-selected:text-orange-900 dark:aria-selected:bg-orange-500/10 dark:aria-selected:text-orange-200',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" aria-hidden />,
        IconRight: () => <ChevronRight className="h-4 w-4" aria-hidden />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };