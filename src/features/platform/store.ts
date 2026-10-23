import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/config/constants';

import type { PlatformUser } from './types';

/**
 * The platform console's session. Separate from every school's: signing in
 * here opens the console, never a school, and the token is sent only to
 * `/platform/…`.
 */
interface PlatformAuthState {
  user: PlatformUser | null;
  token: string | null;
  /** `idle` until the stored token has been checked once on boot. */
  status: 'idle' | 'authenticated' | 'unauthenticated';
  setSession: (user: PlatformUser, token: string) => void;
  setUser: (user: PlatformUser) => void;
  clear: () => void;
  setUnauthenticated: () => void;
}

export const usePlatformAuth = create<PlatformAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: 'idle',
      setSession: (user, token) => set({ user, token, status: 'authenticated' }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, token: null, status: 'unauthenticated' }),
      setUnauthenticated: () => set({ status: 'unauthenticated' }),
    }),
    {
      name: STORAGE_KEYS.platformAuth,
      storage: createJSONStorage(() => window.localStorage),
      // `status` is never stored: a remembered token is checked before use.
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
