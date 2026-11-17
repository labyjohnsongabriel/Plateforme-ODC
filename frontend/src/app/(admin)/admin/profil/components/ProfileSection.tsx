// src/app/admin/profil/components/ProfileSection.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ProfileSection({
  title,
  description,
  children,
  className,
  actions,
}: ProfileSectionProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 sm:p-6',
        'dark:border-slate-800 dark:bg-slate-950',
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}