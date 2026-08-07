import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { toast } from '@/store/toastStore';

import { ApiError } from './apiError';

const MAX_RETRIES = 2;

/**
 * Retry only what is actually worth retrying. 4xx responses are deterministic
 * — repeating them just burns rate limit and delays the error the user needs.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  return error instanceof ApiError ? error.isRetryable : false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: {
      retry: false,
    },
  },

  // Background refetch failures never reach a component's error branch, so
  // surface them here — otherwise stale data sits on screen silently.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipGlobalError) return;
      if (query.state.data === undefined) return; // initial load: the view renders its own error state
      if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden)) return;
      toast.error('Could not refresh data', error.message);
    },
  }),

  // Mutations are user-initiated, so a failure always deserves feedback.
  // Field-level 422s are left to the form; anything else is a toast.
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Opt-out for mutations that report their own outcome (e.g. logout).
      if (mutation.meta?.skipGlobalError) return;

      if (error instanceof ApiError) {
        if (error.isValidationError || error.isUnauthorized) return;
        toast.error('Action failed', error.message);
        return;
      }
      toast.error('Action failed', 'An unexpected error occurred.');
    },
  }),
});
