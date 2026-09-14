// ============================================================================
//  HOOKS GLOBAUX — Export centralisé
// ============================================================================

// Auth
export { useAuth } from './useAuth';

// Fetch & Axios
export { useFetch } from './useFetch';
export {
  useAxios,
  useGet,
  usePost,
  usePut,
  usePatch,
  useDelete,
} from './useAxios';

// Debounce & Throttle
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useDebouncedState,
} from './useDebounce';

// Storage
export { useLocalStorage, useSessionStorage } from './useLocalStorage';

// Pagination
export { usePagination, usePaginatedData } from './usePagination';

// Modal
export { useModal, useModalManager, useConfirm } from './useModal';

// Toast
export { useToast } from './useToast';

// Media Query
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeScreen,
  useBreakpoint,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useIsPortrait,
  useIsLandscape,
  useIsTouchDevice,
  useResponsiveValue,
  BREAKPOINTS,
} from './useMediaQuery';

// Click Outside
export {
  useClickOutside,
  useClickOutsideMultiple,
  useEscapeKey,
  useEnterKey,
  useKeyPress,
} from './useClickOutside';

// Infinite Scroll
export {
  useInfiniteScroll,
  useScrollPosition,
  useScrollDirection,
} from './useInfiniteScroll';

// Form Validation
export {
  useFormValidation,
  useValidationSchema,
  useValidationField,
} from './useFormValidation';

// Types
export type { ValidationError } from './useFormValidation';