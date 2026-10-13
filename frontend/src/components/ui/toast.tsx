// src/components/ui/toast.tsx
'use client';

import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';

export const toast = sonnerToast;

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  action?: React.ReactNode;
}

export function showToast({
  title,
  description,
  variant = 'default',
  action,
}: ToastProps) {
  const options = {
    description,
    action,
    className: cn(
      variant === 'destructive' && 'border-odc-error bg-odc-error-bg',
      variant === 'success' && 'border-odc-success bg-odc-success-bg',
      variant === 'warning' && 'border-odc-warning bg-odc-warning-bg',
    ),
  };

  if (variant === 'destructive') return sonnerToast.error(title, options);
  if (variant === 'success') return sonnerToast.success(title, options);
  if (variant === 'warning') return sonnerToast.warning(title, options);
  return sonnerToast(title, options);
}

export { Toaster } from 'sonner';