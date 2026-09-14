import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
//  USE MODAL — Gestion simple de modale
// ============================================================================

interface UseModalOptions {
  closeOnEscape?: boolean;
  closeOnOverlay?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useModal(initialOpen = false, options: UseModalOptions = {}) {
  const { closeOnEscape = true, closeOnOverlay = true, onOpen, onClose } = options;
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<any>(null);

  // ========================================================================
  // Actions
  // ========================================================================
  const open = useCallback(
    (payload?: any) => {
      setIsOpen(true);
      setData(payload);
      onOpen?.();
    },
    [onOpen]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) onOpen?.();
      else onClose?.();
      return !prev;
    });
  }, [onOpen, onClose]);

  // ========================================================================
  // Escape key
  // ========================================================================
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, close]);

  // ========================================================================
  // Body scroll lock
  // ========================================================================
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
    closeOnOverlay,
  };
}

// ============================================================================
//  USE MODAL MANAGER — Gérer plusieurs modales
// ============================================================================

export function useModalManager<K extends string>(modals: K[]) {
  const [openModals, setOpenModals] = useState<Record<K, boolean>>(
    modals.reduce((acc, m) => ({ ...acc, [m]: false }), {} as Record<K, boolean>)
  );

  const open = useCallback((modal: K) => {
    setOpenModals((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const close = useCallback((modal: K) => {
    setOpenModals((prev) => ({ ...prev, [modal]: false }));
  }, []);

  const closeAll = useCallback(() => {
    setOpenModals(
      modals.reduce((acc, m) => ({ ...acc, [m]: false }), {} as Record<K, boolean>)
    );
  }, [modals]);

  const toggle = useCallback((modal: K) => {
    setOpenModals((prev) => ({ ...prev, [modal]: !prev[modal] }));
  }, []);

  const isOpen = useCallback(
    (modal: K): boolean => openModals[modal],
    [openModals]
  );

  return {
    openModals,
    open,
    close,
    toggle,
    closeAll,
    isOpen,
  };
}

// ============================================================================
//  USE CONFIRM — Confirmation Dialog
// ============================================================================

interface UseConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
}

interface ConfirmState extends UseConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    state?.resolve(false);
    setState(null);
  }, [state]);

  return {
    isOpen: state !== null,
    options: state,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

export default useModal;