import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

import { resolveLandingPath } from '../roleRoutes';
import type { LoginInput } from '../schemas';
import { authService } from '../services/authService';
import type { LoginResponseData } from '../types';

interface LocationState {
  from?: { pathname: string; search?: string };
}

/**
 * Hands control to the app once the server has accepted a sign-in, however it
 * was made.
 *
 * The session is stored (honouring "remember me"), the query cache is cleared
 * so no data from a previous user survives, and the user lands either where
 * they were originally headed or on their role's home page.
 */
function useEnterApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return (data: LoginResponseData, remember: boolean) => {
    // Order matters: install the new credentials first, then drop everything
    // cached for the previous session — clearing first would let the mounted
    // session query refetch with the outgoing token.
    setSession(data.user, data.token, remember);
    queryClient.clear();
    queryClient.setQueryData(queryKeys.auth.session(), data.user);

    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);

    const from = (location.state as LocationState | null)?.from;
    const target = from
      ? `${from.pathname}${from.search ?? ''}`
      : resolveLandingPath(data.user.roles);

    navigate(target, { replace: true });
  };
}

/** Signs the user in with their email and password. */
export function useLogin() {
  const enterApp = useEnterApp();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data, input) => enterApp(data, input.remember),
  });
}

/**
 * Signs in to a demo account with one click — the variable is its email.
 *
 * Never remembered: the session lives in this tab only, so closing it leaves
 * nothing behind on a computer somebody was merely shown the system on.
 */
export function useDemoLogin() {
  const enterApp = useEnterApp();

  return useMutation({
    mutationFn: (email: string) => authService.demoLogin(email),
    onSuccess: (data) => enterApp(data, false),
  });
}
