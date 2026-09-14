import { useCallback, useEffect, useRef, useState } from 'react';
import api, { tokenStorage } from '@/services/api';
import type { AxiosRequestConfig, AxiosError } from 'axios';

// ============================================================================
//  TYPES
// ============================================================================

interface UseAxiosState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

interface UseAxiosReturn<T> extends UseAxiosState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

interface UseAxiosOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string, status?: number) => void;
  transform?: (data: any) => T;
}

// ============================================================================
//  HOOK PRINCIPAL
// ============================================================================

export function useAxios<T = any>(
  config: AxiosRequestConfig | null,
  options: UseAxiosOptions<T> = {}
): UseAxiosReturn<T> {
  const { immediate = false, onSuccess, onError, transform } = options;

  const [state, setState] = useState<UseAxiosState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const isMountedRef = useRef(true);

  // ========================================================================
  // Execute
  // ========================================================================
  const execute = useCallback(
    async (overrideConfig?: AxiosRequestConfig): Promise<T | null> => {
      const finalConfig = { ...config, ...overrideConfig };
      if (!finalConfig.url) return null;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await api.request(finalConfig);
        const data = transform ? transform(response.data.data) : response.data.data;

        if (!isMountedRef.current) return null;

        setState({
          data,
          loading: false,
          error: null,
          status: response.status,
        });

        onSuccess?.(data);
        return data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message || axiosError.message || 'Erreur';
        const status = axiosError.response?.status || null;

        if (!isMountedRef.current) return null;

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          status,
        });

        onError?.(errorMessage, status || undefined);
        return null;
      }
    },
    [JSON.stringify(config), onSuccess, onError, transform]
  );

  // ========================================================================
  // Immediate
  // ========================================================================
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (immediate && config?.url) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  // ========================================================================
  // Reset
  // ========================================================================
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, status: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// ============================================================================
//  HELPERS DE REQUÊTES RAPIDES
// ============================================================================

export function useGet<T = any>(url: string, options?: UseAxiosOptions<T>) {
  return useAxios<T>({ method: 'GET', url }, { ...options, immediate: options?.immediate ?? true });
}

export function usePost<T = any>(url: string, options?: UseAxiosOptions<T>) {
  return useAxios<T>({ method: 'POST', url }, options);
}

export function usePut<T = any>(url: string, options?: UseAxiosOptions<T>) {
  return useAxios<T>({ method: 'PUT', url }, options);
}

export function usePatch<T = any>(url: string, options?: UseAxiosOptions<T>) {
  return useAxios<T>({ method: 'PATCH', url }, options);
}

export function useDelete<T = any>(url: string, options?: UseAxiosOptions<T>) {
  return useAxios<T>({ method: 'DELETE', url }, options);
}

export default useAxios;