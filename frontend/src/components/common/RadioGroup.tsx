import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  direction?: 'horizontal' | 'vertical';
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  direction = 'vertical',
}: RadioGroupProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-3 text-odc-text-light dark:text-odc-text-dark">
          {label}
        </label>
      )}

      <div className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}>
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                'flex items-start gap-2.5 cursor-pointer',
                opt.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                disabled={opt.disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className="sr-only peer"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  'transition-all peer-focus:ring-4 peer-focus:ring-odc-primary/10',
                  checked
                    ? 'border-odc-primary'
                    : 'border-odc-border-light dark:border-odc-border-dark'
                )}
              >
                {checked && <div className="w-2.5 h-2.5 rounded-full bg-odc-primary" />}
              </div>
              <div className="flex-1">
                <div className="text-sm text-odc-text-light dark:text-odc-text-dark">
                  {opt.label}
                </div>
                {opt.description && (
                  <div className="text-xs mt-0.5 text-odc-text-muted-light dark:text-odc-text-muted-dark">
                    {opt.description}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p className="mt-2 text-xs text-odc-error">{error}</p>}
    </div>
  );
}