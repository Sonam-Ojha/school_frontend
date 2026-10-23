import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';

import { authService } from '../services/authService';

/**
 * The demo accounts the server offers for a one-click look around.
 *
 * Most installations offer none, and a server too old to know the endpoint
 * answers with an error — both mean "nothing to show", so callers treat a
 * missing list as an empty one and the failure is never surfaced.
 */
export function useDemoAccounts() {
  return useQuery({
    queryKey: queryKeys.auth.demoAccounts(),
    queryFn: ({ signal }) => authService.demoAccounts(signal),
    staleTime: 5 * 60_000,
    retry: false,
    meta: { skipGlobalError: true },
  });
}
