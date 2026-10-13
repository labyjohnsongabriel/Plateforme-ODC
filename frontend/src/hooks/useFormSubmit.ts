// src/hooks/useFormSubmit.ts
'use client';

import { useCallback, useState } from 'react';
import { getErrorMessage, getValidationErrors } from '@/lib/error-handler';
import { useToast } from './useToast';

export interface UseFormSubmitOptions<TResult = any> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
}

export interface UseFormSubmitReturn<TData, TResult> {
  submit: (data: TData) => Promise<TResult | undefined>;
  isSubmitting: boolean;
  errors: Record<string, string>;
  clearErrors: () => void;
}

export function useFormSubmit<TData = any, TResult = any>(
  submitFn: (data: TData) => Promise<TResult>,
  options: UseFormSubmitOptions<TResult> = {},
): UseFormSubmitReturn<TData, TResult> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const clearErrors = useCallback(() => setErrors({}), []);

  const submit = useCallback(
    async (data: TData): Promise<TResult | undefined> => {
      setIsSubmitting(true);
      setErrors({});

      try {
        const result = await submitFn(data);

        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const message = options.errorMessage || getErrorMessage(error);
        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          const errs = validationErrors.reduce(
            (acc, e) => {
              acc[e.path] = e.message;
              return acc;
            },
            {} as Record<string, string>,
          );
          setErrors(errs);
        } else {
          toast.error(message);
        }

        options.onError?.(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitFn, options, toast],
  );

  return { submit, isSubmitting, errors, clearErrors };
}