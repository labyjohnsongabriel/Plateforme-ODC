import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export function Accordion({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div
            key={item.id}
            className="bg-white dark:bg-odc-surface-dark border border-odc-border-light dark:border-odc-border-dark rounded-xl overflow-hidden"
          >
            <button
              onClick={() => !item.disabled && toggle(item.id)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left',
                'hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {item.icon && <span className="flex-shrink-0 text-odc-primary">{item.icon}</span>}
                <span className="font-medium text-odc-text-light dark:text-odc-text-dark truncate">
                  {item.title}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={cn(
                  'flex-shrink-0 text-odc-text-muted-light transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="px-4 pb-4 pt-1 text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark border-t border-odc-border-light dark:border-odc-border-dark">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}