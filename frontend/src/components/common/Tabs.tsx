import { ReactNode, useState } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  value?: string;
  onChange?: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({ items, defaultTab, value, onChange, variant = 'default' }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultTab || items[0]?.id);
  const activeTab = value ?? internalValue;

  const handleChange = (id: string) => {
    if (onChange) onChange(id);
    else setInternalValue(id);
  };

  const variants = {
    default: 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark p-1 rounded-lg',
    pills: 'gap-2',
    underline: 'border-b border-odc-border-light dark:border-odc-border-dark gap-1',
  };

  const tabVariants = {
    default: (active: boolean) =>
      cn(
        'px-4 py-2 rounded-md text-sm font-medium transition-all',
        active
          ? 'bg-white dark:bg-odc-surface-dark text-odc-primary shadow-sm'
          : 'text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-text-light dark:hover:text-odc-text-dark'
      ),
    pills: (active: boolean) =>
      cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all',
        active
          ? 'bg-odc-primary text-white shadow-odc-sm'
          : 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20'
      ),
    underline: (active: boolean) =>
      cn(
        'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
        active
          ? 'border-odc-primary text-odc-primary'
          : 'border-transparent text-odc-text-muted-light hover:text-odc-primary hover:border-odc-primary-soft'
      ),
  };

  return (
    <div className="w-full">
      <div className={cn('flex', variants[variant])}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && handleChange(item.id)}
            disabled={item.disabled}
            className={cn(
              tabVariants[variant](activeTab === item.id),
              'flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full font-semibold',
                  activeTab === item.id
                    ? 'bg-odc-primary text-white'
                    : 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark'
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {items.find((i) => i.id === activeTab)?.content && (
        <div className="mt-4 animate-fade-in">
          {items.find((i) => i.id === activeTab)?.content}
        </div>
      )}
    </div>
  );
}