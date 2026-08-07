import type { ReactNode } from 'react';

import { useAuthStore } from '@/store/authStore';

interface CanProps {
  /** Any one of these Spatie permissions grants access. */
  permissions?: string[];
  /** Any one of these roles grants access. */
  roles?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditional rendering by role or permission — for hiding buttons, columns
 * and menu entries. Route-level access is enforced by `ProtectedRoute`, and
 * both are advisory: the API remains the authority.
 */
export function Can({ permissions, roles, children, fallback = null }: CanProps) {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);

  const allowed =
    (!roles || hasAnyRole(roles)) && (!permissions || hasAnyPermission(permissions));

  return <>{allowed ? children : fallback}</>;
}
