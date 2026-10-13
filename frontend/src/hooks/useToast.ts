// src/hooks/useToast.ts
'use client';

import { toast } from 'sonner';

export interface ToastHelpers {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  loading: (message: string) => string | number;
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) => Promise<T>;
  dismiss: (id?: string | number) => void;
  custom: (message: string, options?: any) => void;
}

export function useToast(): ToastHelpers {
  return {
    success: (message, description) =>
      toast.success(message, { description }),
    error: (message, description) =>
      toast.error(message, { description }),
    info: (message, description) =>
      toast.info(message, { description }),
    warning: (message, description) =>
      toast.warning(message, { description }),
    loading: (message) => toast.loading(message),
    promise: <T,>(promise: Promise<T>, messages: any) =>
      toast.promise(promise, messages),
    dismiss: (id) => toast.dismiss(id),
    custom: (message, options) => toast(message, options),
  };
}