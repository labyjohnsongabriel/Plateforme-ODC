import { useCallback, useState } from 'react';
import { z, ZodError, ZodSchema } from 'zod';

// ============================================================================
//  TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
  initialValues: T;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: string, message: string) => void;
  setTouched: (field: string, touched?: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (
    onSubmit: (values: T) => Promise<void> | void
  ) => (e?: React.FormEvent) => Promise<void>;
  reset: (values?: T) => void;
  resetField: (field: keyof T) => void;
}

// ============================================================================
//  USE FORM VALIDATION
// ============================================================================

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const { schema, initialValues, validateOnChange = false, validateOnBlur = true } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ========================================================================
  // Validate all
  // ========================================================================
  const validateAll = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  // ========================================================================
  // Validate field
  // ========================================================================
  const validateField = useCallback(
    (field: keyof T): boolean => {
      try {
        schema.parse(values);
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field as string];
          return next;
        });
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors.find((e) => e.path[0] === field);
          if (fieldError) {
            setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
            return false;
          }
          setErrors((prev) => {
            const next = { ...prev };
            delete next[field as string];
            return next;
          });
        }
        return true;
      }
    },
    [schema, values]
  );

  // ========================================================================
  // Set value
  // ========================================================================
  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      if (validateOnChange) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validateField]
  );

  // ========================================================================
  // Set multiple values
  // ========================================================================
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  // ========================================================================
  // Set error
  // ========================================================================
  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  // ========================================================================
  // Set touched
  // ========================================================================
  const setTouched = useCallback((field: string, isTouched = true) => {
    setTouchedState((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // ========================================================================
  // Handle change
  // ========================================================================
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;

      let parsedValue: any = value;
      if (type === 'number') parsedValue = value === '' ? '' : Number(value);
      if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

      setValue(name as keyof T, parsedValue);
    },
    [setValue]
  );

  // ========================================================================
  // Handle blur
  // ========================================================================
  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name } = e.target;
      setTouched(name);

      if (validateOnBlur) {
        validateField(name as keyof T);
      }
    },
    [setTouched, validateOnBlur, validateField]
  );

  // ========================================================================
  // Handle submit
  // ========================================================================
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) =>
      async (e?: React.FormEvent) => {
        e?.preventDefault();

        // Toucher tous les champs
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        );
        setTouchedState(allTouched);

        if (!validateAll()) return;

        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, validateAll]
  );

  // ========================================================================
  // Reset
  // ========================================================================
  const reset = useCallback(
    (newValues?: T) => {
      setValuesState(newValues || initialValues);
      setErrors({});
      setTouchedState({});
      setIsDirty(false);
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const resetField = useCallback(
    (field: keyof T) => {
      setValuesState((prev) => ({ ...prev, [field]: initialValues[field] }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
      setTouchedState((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,
    isDirty,
    isSubmitting,
    setValue,
    setValues,
    setError,
    setTouched,
    validateField,
    validateAll,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
  };
}

// ============================================================================
//  USE VALIDATION SCHEMA
// ============================================================================

export function useValidationSchema<T>(schema: ZodSchema<T>) {
  const validate = useCallback(
    (data: unknown): { success: boolean; errors?: Record<string, string>; data?: T } => {
      try {
        const result = schema.parse(data);
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {};
          error.errors.forEach((err) => {
            const field = err.path.join('.');
            errors[field] = err.message;
          });
          return { success: false, errors };
        }
        return { success: false, errors: { _error: 'Erreur de validation' } };
      }
    },
    [schema]
  );

  return { validate, schema };
}

// ============================================================================
//  USE VALIDATION FIELD
// ============================================================================

export function useValidationField<T>(
  schema: ZodSchema<T>,
  field: keyof T,
  value: any
): { valid: boolean; error: string | null } {
  const [valid, setValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    try {
      schema.parse({ [field]: value });
      setValid(true);
      setError(null);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldError = err.errors.find((e) => e.path[0] === field);
        if (fieldError) {
          setValid(false);
          setError(fieldError.message);
        }
      }
    }
  }, [schema, field, value]);

  return { valid, error };
}

export default useFormValidation;