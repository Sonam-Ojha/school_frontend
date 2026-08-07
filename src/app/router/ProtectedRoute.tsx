import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { useAuthStore } from '@/store/authStore';

import { PATHS } from './paths';

interface ProtectedRouteProps {
  /** Any one of these roles grants access. */
  roles?: string[];
  /** Any one of these permissions grants access. */
  permissions?: string[];
}

/**
 * Gate for authenticated areas.
 *
 * Renders a loader while the session is still resolving, bounces anonymous
 * users to login (remembering where they came from), and sends
 * authenticated-but-unauthorised users to the 403 page rather than login —
 * signing in again would not help them.
 */
export function ProtectedRoute({ roles, permissions }: ProtectedRouteProps) {
  const location = useLocation();
  const status = useAuthStore((state) => state.status);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);

  if (status === 'idle') {
    return <FullPageLoader label="Restoring your session…" />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to={PATHS.login} state={{ from: location }} replace />;
  }

  const roleAllowed = !roles || hasAnyRole(roles);
  const permissionAllowed = !permissions || hasAnyPermission(permissions);

  if (!roleAllowed || !permissionAllowed) {
    return <Navigate to={PATHS.forbidden} replace />;
  }

  return <Outlet />;
}
