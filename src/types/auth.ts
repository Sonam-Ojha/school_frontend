/**
 * Auth shapes. Roles and permissions come from Spatie's
 * `HasRoles` trait exposed through the user API Resource.
 */

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  email_verified_at: string | null;
  roles: string[];
  permissions: string[];
  created_at: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string | null;
}

/**
 * Canonical role slugs. Keep in sync with the backend RoleSeeder.
 *
 * Declaration order is precedence, most privileged first — `roleRoutes` and
 * the role badges both rely on it.
 */
export const ROLES = {
  superAdmin: 'super-admin',
  schoolAdmin: 'school-admin',
  principal: 'principal',
  vicePrincipal: 'vice-principal',
  teacher: 'teacher',
  accountant: 'accountant',
  receptionist: 'receptionist',
  librarian: 'librarian',
  staff: 'staff',
  parent: 'parent',
  student: 'student',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Human-readable labels for the canonical roles. */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.superAdmin]: 'Super Admin',
  [ROLES.schoolAdmin]: 'School Admin',
  [ROLES.principal]: 'Principal',
  [ROLES.vicePrincipal]: 'Vice Principal',
  [ROLES.teacher]: 'Teacher',
  [ROLES.accountant]: 'Accountant',
  [ROLES.receptionist]: 'Receptionist',
  [ROLES.librarian]: 'Librarian',
  [ROLES.staff]: 'Staff',
  [ROLES.parent]: 'Parent',
  [ROLES.student]: 'Student',
};

/** Title-cases any role slug, preferring the canonical label when known. */
export function roleLabel(slug: string): string {
  return (
    ROLE_LABELS[slug as Role] ??
    slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}
