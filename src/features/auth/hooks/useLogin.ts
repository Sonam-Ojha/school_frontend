import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

import { resolveLandingPath } from '../roleRoutes';
import type { LoginInput } from '../schemas';
import { authService } from '../services/authService';

interface LocationState {
  from?: { pathname: string; search?: string };
}

/**
 * Signs the user in and hands control to the app.
 *
 * On success the session is stored (honouring "remember me"), the query cache
 * is cleared so no data from a previous user survives, and the user lands
 * either where they were originally headed or on their role's home page.
 */
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),

    onSuccess: (data, input) => {
      // Order matters: install the new credentials first, then drop everything
      // cached for the previous session — clearing first would let the mounted
      // session query refetch with the outgoing token.
      setSession(data.user, data.token, input.remember);
      queryClient.clear();
      queryClient.setQueryData(queryKeys.auth.session(), data.user);

      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);

      const from = (location.state as LocationState | null)?.from;
      const target = from
        ? `${from.pathname}${from.search ?? ''}`
        : resolveLandingPath(data.user.roles);

      navigate(target, { replace: true });
    },
  });
}
