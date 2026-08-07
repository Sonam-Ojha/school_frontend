import { useQueryClient } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import { STORAGE_KEYS } from '@/config/constants';
import { useSessionQuery } from '@/features/auth/hooks/useSession';
import { setUnauthorizedHandler } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

/**
 * Owns session lifecycle for the whole app:
 *
 * 1. **Boot revalidation** — `useSessionQuery` checks the stored credentials
 *    against `GET /auth/me` before any protected screen renders, so a session
 *    revoked server-side never reaches the UI.
 * 2. **Expiry** — the axios interceptor clears the store on a 401; this wires
 *    the accompanying notice. `ProtectedRoute` reacts to the status change and
 *    redirects, so no router access is needed here.
 * 3. **Cross-tab sync** — signing out in one tab signs out the others.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useSessionQuery();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      toast.warning('Session expired', 'Please sign in again to continue.');
    });
  }, [queryClient]);

  useEffect(() => {
    /**
     * `storage` only fires for localStorage and only in *other* tabs, so this
     * syncs remembered sessions. Unremembered ones live in sessionStorage and
     * are tab-scoped by design — nothing to sync.
     */
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEYS.auth) return;

      const { status, clearSession, setSession } = useAuthStore.getState();

      if (event.newValue === null) {
        if (status !== 'authenticated') return;
        clearSession();
        queryClient.clear();
        toast.info('Signed out', 'You signed out in another tab.');
        return;
      }

      // Signed in elsewhere — adopt that session instead of staying on the
      // login screen.
      if (status === 'authenticated') return;

      void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
        const { user, token, remember } = useAuthStore.getState();
        if (user) setSession(user, token, remember);
      });
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [queryClient]);

  return <>{children}</>;
}
