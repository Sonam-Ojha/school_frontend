import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/config/constants';
import { ROLES, type AuthUser } from '@/types/auth';

/**
 * "Remember me" storage router.
 *
 * Remembered sessions go to `localStorage` and survive a browser restart;
 * unremembered ones go to `sessionStorage` and die with the tab. Writes always
 * clear the other backend so a session can never linger in both places.
 */
const rememberAwareStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.sessionStorage.getItem(name) ?? window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },

  setItem: (name, value) => {
    try {
      const remember = Boolean(
        (JSON.parse(value) as { state?: { remember?: boolean } })?.state?.remember,
      );
      const [target, other] = remember
        ? [window.localStorage, window.sessionStorage]
        : [window.sessionStorage, window.localStorage];

      target.setItem(name, value);
      other.removeItem(name);
    } catch {
      /* storage disabled or quota exceeded — session stays in memory only */
    }
  },

  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
      window.sessionStorage.removeItem(name);
    } catch {
      /* no-op */
    }
  },
};

/**
 * Session state only. This store performs no I/O — the auth feature module
 * owns the login/logout/me requests and pushes results in here. Keeping it
 * side-effect free is what lets the axios interceptor read it without a cycle.
 */
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  /** `idle` until the session has been resolved once on boot. */
  status: 'idle' | 'authenticated' | 'unauthenticated';
  /** Chosen at login; decides whether the session outlives the tab. */
  remember: boolean;

  setSession: (user: AuthUser, token: string | null, remember?: boolean) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  /** Marks boot-time session resolution as finished with no valid session. */
  setUnauthenticated: () => void;

  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: 'idle',
      remember: false,

      setSession: (user, token, remember) =>
        set((state) => ({
          user,
          token,
          status: 'authenticated',
          remember: remember ?? state.remember,
        })),

      setUser: (user) => set({ user }),

      clearSession: () =>
        set({ user: null, token: null, status: 'unauthenticated', remember: false }),

      setUnauthenticated: () => set({ status: 'unauthenticated' }),

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        // super-admin bypasses every check, mirroring Spatie's Gate::before.
        return user.roles.includes(ROLES.superAdmin) || user.roles.includes(role);
      },

      hasAnyRole: (roles) => {
        if (roles.length === 0) return true;
        return roles.some((role) => get().hasRole(role));
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.roles.includes(ROLES.superAdmin) || user.permissions.includes(permission);
      },

      hasAnyPermission: (permissions) => {
        if (permissions.length === 0) return true;
        return permissions.some((permission) => get().hasPermission(permission));
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => rememberAwareStorage),
      // Never persist `status`: a rehydrated 'authenticated' would let a stale
      // session render protected UI before the server has revalidated it.
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        remember: state.remember,
      }),
    },
  ),
);

/** Non-reactive accessors for use outside React (interceptors, loaders). */
export const authStore = {
  getToken: () => useAuthStore.getState().token,
  getUser: () => useAuthStore.getState().user,
  clear: () => useAuthStore.getState().clearSession(),
};
