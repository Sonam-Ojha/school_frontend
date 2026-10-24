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
  /** Personal overrides on top of the roles: rights added, and rights taken away. */
  granted_permissions?: string[];
  revoked_permissions?: string[];
  /** Classes, sections and subjects this member of staff is limited to; null is the whole school. */
  access_scope?: AccessScope | null;
  /** Groups of sensitive details this user's roles keep hidden from them. */
  hidden_fields?: string[];
}

export interface AccessScope {
  class_ids: number[];
  section_ids: number[];
  subject_ids: number[];
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
 * Canonical role slugs. Keep in sync with the backend (`src/engine/lib/roles.ts`).
 *
 * Declaration order is precedence, most privileged first — `roleRoutes` and
 * the role badges both rely on it.
 *
 * Inside a school, `super-admin` is the School Admin (full access). The
 * platform's own Super Admin is not a school role: that account lives in the
 * console at /superadmin. `school-admin` is kept only for schools created
 * before the sixteen built-in roles.
 */
export const ROLES = {
  superAdmin: 'super-admin',
  schoolAdmin: 'school-admin',
  principal: 'principal',
  vicePrincipal: 'vice-principal',
  academicCoordinator: 'academic-coordinator',
  examCoordinator: 'exam-coordinator',
  classTeacher: 'class-teacher',
  teacher: 'teacher',
  accountant: 'accountant',
  hrManager: 'hr-manager',
  receptionist: 'receptionist',
  librarian: 'librarian',
  transportManager: 'transport-manager',
  hostelWarden: 'hostel-warden',
  staff: 'staff',
  parent: 'parent',
  student: 'student',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Human-readable labels for the canonical roles. */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.superAdmin]: 'School Admin (Full Access)',
  [ROLES.schoolAdmin]: 'Administrator (legacy)',
  [ROLES.principal]: 'Principal',
  [ROLES.vicePrincipal]: 'Vice Principal',
  [ROLES.academicCoordinator]: 'Academic Coordinator / HOD',
  [ROLES.examCoordinator]: 'Exam Coordinator',
  [ROLES.classTeacher]: 'Class Teacher',
  [ROLES.teacher]: 'Subject Teacher',
  [ROLES.accountant]: 'Accountant',
  [ROLES.hrManager]: 'HR Manager',
  [ROLES.receptionist]: 'Admission Officer / Front Office',
  [ROLES.librarian]: 'Librarian',
  [ROLES.transportManager]: 'Transport Manager',
  [ROLES.hostelWarden]: 'Hostel Warden',
  [ROLES.staff]: 'Support Staff',
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
