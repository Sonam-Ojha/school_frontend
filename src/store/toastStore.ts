import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  /** Milliseconds before auto-dismiss. `0` pins the toast until dismissed. */
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const DEFAULT_DURATION = 5000;
/** Errors stay longer — they usually carry an action the user must read. */
const ERROR_DURATION = 8000;
/** Cap the stack so a request storm cannot bury the screen. */
const MAX_TOASTS = 4;

let counter = 0;
const nextId = () => `toast-${++counter}`;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  push: ({ duration, variant, ...rest }) => {
    const id = nextId();
    const toast: Toast = {
      id,
      variant,
      duration: duration ?? (variant === 'error' ? ERROR_DURATION : DEFAULT_DURATION),
      ...rest,
    };
    set((state) => ({ toasts: [...state.toasts, toast].slice(-MAX_TOASTS) }));
    return id;
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));

/**
 * Imperative API usable anywhere — including outside React, which is how the
 * TanStack Query cache reports background failures.
 */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'error', title, description }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'warning', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: 'info', title, description }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
