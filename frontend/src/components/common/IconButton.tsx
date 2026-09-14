import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { cn } from '@/utils/cn';

// ============================================================================
//  TYPES
// ============================================================================

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  'aria-label': string;
}

// ============================================================================
//  STYLES
// ============================================================================

const sizeMap: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

// ============================================================================
//  COMPONENT
// ============================================================================

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'ghost',
      size = 'md',
      loading = false,
      disabled,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || loading}
        className={cn('!p-0 !rounded-full', sizeMap[size], className)}
        {...rest}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';