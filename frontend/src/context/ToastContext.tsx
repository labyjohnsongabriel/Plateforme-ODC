import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ============================================================================
//  TYPES
// ============================================================================

interface ToastContextValue {
  success: (message: string, options?: any) => void;
  error: (message: string, options?: any) => void;
  info: (message: string, options?: any) => void;
  warning: (message: string, options?: any) => void;
  loading: (message: string, options?: any) => string;
  dismiss: (id?: string) => void;
  dismissAll: () => void;
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ============================================================================
//  PROVIDER
// ============================================================================

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const success = useCallback((message: string, options?: any) => {
    toast.success(message, {
      duration: 3000,
      icon: '✅',
      ...options,
    });
  }, []);

  const error = useCallback((message: string, options?: any) => {
    toast.error(message, {
      duration: 4000,
      icon: '❌',
      ...options,
    });
  }, []);

  const info = useCallback((message: string, options?: any) => {
    toast(message, {
      duration: 3500,
      icon: 'ℹ️',
      ...options,
    });
  }, []);

  const warning = useCallback((message: string, options?: any) => {
    toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        background: '#FFF3E0',
        color: '#F57C00',
        border: '1px solid #F57C00',
      },
      ...options,
    });
  }, []);

  const loading = useCallback((message: string, options?: any): string => {
    return toast.loading(message, options);
  }, []);

  const dismiss = useCallback((id?: string) => {
    toast.dismiss(id);
  }, []);

  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  const promise = useCallback(
    async <T,>(
      promiseToRun: Promise<T>,
      messages: { loading: string; success: string; error: string }
    ): Promise<T> => {
      return toast.promise(promiseToRun, messages);
    },
    []
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success,
      error,
      info,
      warning,
      loading,
      dismiss,
      dismissAll,
      promise,
    }),
    [success, error, info, warning, loading, dismiss, dismissAll, promise]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--odc-surface)',
            color: 'var(--odc-text-primary)',
            border: '1px solid var(--odc-border)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 10px 25px rgba(255, 121, 0, 0.12)',
            maxWidth: '400px',
          },
        }}
      />
    </ToastContext.Provider>
  );
}

// ============================================================================
//  HOOK
// ============================================================================

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export default ToastContext;