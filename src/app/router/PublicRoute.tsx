import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { useAuthStore } from '@/store/authStore';

import { PATHS } from './paths';

interface LocationState {
  from?: { pathname: string };
}

/**
 * Guest-only routes (login, forgot password). An already-authenticated user is
 * returned to wherever they were headed before the redirect to login.
 */
export function PublicRoute() {
  const location = useLocation();
  const status = useAuthStore((state) => state.status);

  if (status === 'idle') {
    return <FullPageLoader />;
  }

  if (status === 'authenticated') {
    const from = (location.state as LocationState | null)?.from?.pathname;
    return <Navigate to={from ?? PATHS.dashboard} replace />;
  }

  return <Outlet />;
}
