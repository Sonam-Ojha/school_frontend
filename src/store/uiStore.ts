import { create } from 'zustand';

/**
 * Chrome-level UI state. The desktop sidebar opens on hover and needs no
 * state; the mobile drawer must always boot closed, so nothing is persisted.
 */
interface UiState {
  mobileNavOpen: boolean;

  openMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  mobileNavOpen: false,

  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}));
