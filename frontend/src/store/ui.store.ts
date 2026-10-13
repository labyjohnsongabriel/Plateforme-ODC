// src/store/ui.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ============================================================================
   TYPES
   ============================================================================ */

export type ThemeMode = 'light' | 'dark' | 'system';

export type ModalName =
  | 'newConversation'
  | 'deleteConfirm'
  | 'filterPanel'
  | 'exportDialog'
  | 'importDialog'
  | 'commandPalette'
  | null;

export interface ModalState {
  name: ModalName;
  data?: any;
}

export interface UIState {
  /* -------------------- SIDEBAR -------------------- */
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;

  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setSidebarMobileOpen: (v: boolean) => void;

  /* -------------------- THÈME -------------------- */
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  /* -------------------- MODALES -------------------- */
  modal: ModalState;
  openModal: (name: ModalName, data?: any) => void;
  closeModal: () => void;

  /* -------------------- COMMAND PALETTE -------------------- */
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  /* -------------------- MOBILE MENU -------------------- */
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;

  /* -------------------- GLOBAL LOADING -------------------- */
  globalLoading: boolean;
  setGlobalLoading: (v: boolean) => void;

  /* -------------------- RESET -------------------- */
  resetUI: () => void;
}

/* ============================================================================
   STORE
   ============================================================================ */

const initialState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'system' as ThemeMode,
  modal: { name: null } as ModalState,
  commandPaletteOpen: false,
  isMobileMenuOpen: false,
  globalLoading: false,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,

      /* -------------------- SIDEBAR -------------------- */
      toggleSidebar: () =>
        set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),

      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setSidebarMobileOpen: (v) => set({ sidebarMobileOpen: v }),

      /* -------------------- THÈME -------------------- */
      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      /* -------------------- MODALES -------------------- */
      openModal: (name, data) => set({ modal: { name, data } }),
      closeModal: () => set({ modal: { name: null } }),

      /* -------------------- COMMAND PALETTE -------------------- */
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      /* -------------------- MOBILE MENU -------------------- */
      setMobileMenuOpen: (v) => set({ isMobileMenuOpen: v }),

      /* -------------------- GLOBAL LOADING -------------------- */
      setGlobalLoading: (v) => set({ globalLoading: v }),

      /* -------------------- RESET -------------------- */
      resetUI: () => set(initialState),
    }),
    {
      name: 'odc-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
      version: 1,
    },
  ),
);

/* ============================================================================
   SÉLECTEURS
   ============================================================================ */

export const selectSidebarCollapsed = (s: UIState) => s.sidebarCollapsed;
export const selectTheme = (s: UIState) => s.theme;
export const selectModal = (s: UIState) => s.modal;
export const selectCommandPaletteOpen = (s: UIState) => s.commandPaletteOpen;
export const selectGlobalLoading = (s: UIState) => s.globalLoading;