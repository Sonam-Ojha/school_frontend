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
  /**
   * True on a shared demo account, entered with one click from the sign-in
   * page. The API refuses it account, role and mail changes; the UI labels
   * the session so that a refusal is no surprise.
   */
  is_demo?: boolean;
  /**
   * The roster records this account belongs to: a parent's children (or the
   * one student a student account is), and a teacher's or staff member's own
   * record. Set by an administrator on the Users screen.
   */
  links?: UserLinks;
  /**
   * Permissions held only through a family role (parent, student). The API
   * answers these with the family's own children's records, never the school's.
   */
  scoped_permissions?: string[];
  /** True when every role the user holds is a family role. */
  is_portal?: boolean;
}

export interface UserLinks {
  student_ids: number[];
  teacher_id: number | null;
  staff_id: number | null;
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
