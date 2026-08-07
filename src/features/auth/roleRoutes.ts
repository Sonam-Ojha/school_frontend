import { PATHS } from '@/app/router/paths';
import { ROLES } from '@/types/auth';

/**
 * Role-based landing routes.
 *
 * After sign-in a user is sent to the first entry here that matches one of
 * their roles, so each audience opens on the screen that is useful to them.
 * Order is precedence: the most privileged role wins when a user holds
 * several. Feature modules add their own home route as they are installed.
 */
const ROLE_HOME: ReadonlyArray<readonly [role: string, path: string]> = [
  [ROLES.superAdmin, PATHS.dashboard],
  [ROLES.schoolAdmin, PATHS.dashboard],
  [ROLES.principal, PATHS.dashboard],
  [ROLES.vicePrincipal, PATHS.dashboard],
  [ROLES.accountant, PATHS.dashboard],
  [ROLES.receptionist, PATHS.dashboard],
  [ROLES.librarian, PATHS.dashboard],
  [ROLES.teacher, PATHS.dashboard],
  [ROLES.staff, PATHS.dashboard],
  [ROLES.parent, PATHS.dashboard],
  [ROLES.student, PATHS.dashboard],
];

/** Home route for a user's roles, falling back to the shared dashboard. */
export function resolveLandingPath(roles: string[]): string {
  const match = ROLE_HOME.find(([role]) => roles.includes(role));
  return match?.[1] ?? PATHS.dashboard;
}
