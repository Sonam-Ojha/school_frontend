import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { env } from '@/config/env';
import { ApiError } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

import { authService } from '../services/authService';

/**
 * Revalidates the stored session against `GET /auth/me` on boot.
 *
 * The store rehydrates `user`/`token` optimistically but never rehydrates
 * `status`; this hook is what resolves it. A session revoked or expired
 * server-side is therefore caught before any protected screen renders, and the
 * user record is refreshed so role and permission changes take effect on the
 * next page load rather than at the next sign-in.
 */
export function useSessionQuery() {
  const token = useAuthStore((state) => state.token);
  const status = useAuthStore((state) => state.status);

  // Nothing to revalidate in token mode without a token — skip the guaranteed
  // 401 and settle as unauthenticated immediately.
  const enabled = env.authMode === 'cookie' ? true : Boolean(token);

  const query = useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: ({ signal }) => authService.me(signal),
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    // A 401 here is the expected "not signed in" answer, not a failure.
    meta: { skipGlobalError: true },
  });

  const { data, error, isError, isSuccess } = query;

  useEffect(() => {
    if (!enabled) {
      // No credentials at all — resolve the boot state without a request.
      const { setUnauthenticated } = useAuthStore.getState();
      if (status === 'idle') setUnauthenticated();
      return;
    }

    if (isSuccess && data) {
      const { token: currentToken, remember, setSession } = useAuthStore.getState();
      setSession(data, currentToken, remember);
      return;
    }

    if (isError) {
      const { clearSession, setUnauthenticated } = useAuthStore.getState();
      // 401/403 means the credentials are dead; anything else (network, 5xx)
      // should not destroy a session that may still be valid.
      if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden)) clearSession();
      else setUnauthenticated();
    }
  }, [enabled, isSuccess, isError, data, error, status]);

  return query;
}
