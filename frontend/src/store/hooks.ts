import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// ============================================================================
//  TYPED HOOKS
// ============================================================================

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================================================
//  UTILITY HOOKS
// ============================================================================

/**
 * Hook pour sélectionner une valeur avec une fonction
 */
export function useAppSelectorFn<T>(selector: (state: RootState) => T): T {
  return useAppSelector(selector);
}

/**
 * Hook pour dispatcher plusieurs actions
 */
export function useActions<T extends (...args: any[]) => any>(actions: T[]): T[] {
  const dispatch = useAppDispatch();
  return actions.map((action) => ((...args: any[]) => dispatch(action(...args))) as T);
}

export default {
  useAppDispatch,
  useAppSelector,
  useAppSelectorFn,
  useActions,
};