import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

import { authService } from '../services/authService';

interface UseLogoutOptions {
  /** Revoke every device's token, not just this one. */
  allDevices?: boolean;
}

/**
 * Signs the user out.
 *
 * Local state is cleared whether or not the server call succeeds — an
 * expired or already-revoked token still means the user is signed out, and
 * leaving them stuck in the app would be worse than a silently failed revoke.
 */
export function useLogout({ allDevices = false }: UseLogoutOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => (allDevices ? authService.logoutAll() : authService.logout()),

    onSettled: () => {
      // Naming the page tells the route guard this was a deliberate exit, so
      // it does not keep the page as somewhere to return to after sign-in.
      clearSession({ signedOutAt: location.key });
      queryClient.clear();
      navigate(PATHS.login, { replace: true });
      toast.success(allDevices ? 'Signed out on all devices' : 'You have been signed out');
    },

    // The toast above already covers the outcome; suppress the global handler.
    meta: { skipGlobalError: true },
  });
}
