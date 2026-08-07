import type { Permission, Role, RoleDetail } from '@/features/roles/types';
import type { AcademicYear, SchoolSettings } from '@/features/settings/types';
import type { AuthUser } from '@/types/auth';
import { ROLES } from '@/types/auth';

/**
 * Seed data for the development mock API.
 *
 * This mirrors what the Laravel seeders are expected to produce, so the UI is
 * exercised against realistic shapes. Delete `src/mocks/` once the backend is
 * running — see `src/mocks/README.md`.
 */

const ALL_ACTIONS = ['create', 'read', 'update', 'delete', 'export', 'print', 'approve'] as const;

/**
 * Which actions each resource exposes. Deliberately uneven — several
 * resources have no `approve` or `create`, which is what makes the matrix
 * render "not applicable" cells instead of unsatisfiable checkboxes.
 */
const RESOURCE_ACTIONS: Record<string, readonly string[]> = {
  students: ALL_ACTIONS,
  teachers: ALL_ACTIONS,
  staff: ['create', 'read', 'update', 'delete', 'export'],
  'academics.classes': ['create', 'read', 'update', 'delete'],
  'academics.subjects': ['create', 'read', 'update', 'delete'],
  attendance: ['create', 'read', 'update', 'export', 'print', 'approve'],
  // Building the grid and configuring it are one right; the room register is
  // a separate one, because a room outlives any particular timetable.
  timetable: ['create', 'read', 'update', 'delete', 'export', 'print'],
  rooms: ['create', 'read', 'update', 'delete'],
  exams: ALL_ACTIONS,
  fees: ALL_ACTIONS,
  // `approve` signs off a costed run and is deliberately separate from
  // `update`: processing a payroll is arithmetic, approving it is a decision,
  // and schools routinely give those two to different people.
  payroll: ALL_ACTIONS,
  // `print` covers barcode labels; `approve` is the fine-waiver right, which
  // schools routinely withhold from the desk assistant who collects them.
  library: ALL_ACTIONS,
  // `approve` is the right to amend a closed roll call — a correction to last
  // week's register is a decision, not a keystroke.
  hostel: ALL_ACTIONS,
  // `approve` is the decision right, and it is deliberately separate from
  // `update`: filing somebody's application for them is clerical, granting it
  // is not, and schools routinely give those two to different people.
  leave: ['create', 'read', 'update', 'delete', 'export', 'approve'],
  // `print` is the route sheet a driver carries; there is nothing here to
  // approve, so the resource stops short of the full set.
  transport: ['create', 'read', 'update', 'delete', 'export', 'print'],
  // `approve` is the right to put a notice on the board.
  notices: ['create', 'read', 'update', 'delete', 'print', 'approve'],
  // Two resources, because they are two acts: pinning a notice is not the
  // same as pushing an SMS to nine hundred parents at eleven at night.
  // `approve` here is the right to actually release a broadcast.
  communication: ['create', 'read', 'update', 'delete', 'export', 'approve'],
  reports: ['read', 'export', 'print'],
  users: ['create', 'read', 'update', 'delete', 'export'],
  roles: ['create', 'read', 'update', 'delete'],
  permissions: ['read'],
  settings: ['read', 'update'],
  'academic-years': ['create', 'read', 'update', 'delete'],
  holidays: ['create', 'read', 'update', 'delete'],
  // `approve` is the grading right — marking a submission, not setting one.
  homework: ['create', 'read', 'update', 'delete', 'approve'],
  // `approve` evaluates a submission; `print` releases the marks to students.
  // Deliberately separate: scoring work and publishing results are different
  // acts, and schools routinely let a teacher do the first but not the second.
  assignments: ALL_ACTIONS,
};

function buildPermissions(): Permission[] {
  const list: Permission[] = [];
  let id = 1;

  for (const [resource, actions] of Object.entries(RESOURCE_ACTIONS)) {
    for (const action of actions) {
      list.push({
        id: id++,
        name: `${resource}.${action}`,
        guard_name: 'web',
        created_at: '2024-01-01T00:00:00.000000Z',
      });
    }
  }

  return list;
}

export const permissions: Permission[] = buildPermissions();

const names = (predicate: (name: string) => boolean): string[] =>
  permissions.map((permission) => permission.name).filter(predicate);

const readOnly = (resources: string[]): string[] =>
  names((name) => resources.some((resource) => name === `${resource}.read`));

const fullAccess = (resources: string[]): string[] =>
  names((name) => resources.some((resource) => name.startsWith(`${resource}.`)));

/** role slug → granted permission names. `super-admin` is intentionally empty. */
const ROLE_PERMISSION_SETS: Record<string, string[]> = {
  [ROLES.superAdmin]: [],
  [ROLES.schoolAdmin]: names((name) => !name.startsWith('permissions.')),
  [ROLES.principal]: [
    ...fullAccess(['students', 'teachers', 'staff', 'academics.classes', 'academics.subjects']),
    ...fullAccess(['exams', 'attendance', 'notices', 'reports']),
    // The head grants leave — including their own staff's, which is the whole
    // point of the right being separate from `update`.
    ...fullAccess(['leave']),
    ...fullAccess(['communication']),
    ...fullAccess(['timetable', 'rooms']),
    ...fullAccess(['hostel']),
    // The principal signs the payroll off but does not build it.
    ...readOnly(['payroll']),
    'payroll.approve',
    'payroll.print',
    ...readOnly(['fees', 'library', 'transport', 'users', 'roles', 'settings']),
    ...fullAccess(['academic-years']),
  ],
  [ROLES.vicePrincipal]: [
    ...fullAccess(['students', 'academics.classes', 'academics.subjects', 'attendance']),
    // The deputy builds the timetable but does not add rooms to the estate.
    ...fullAccess(['timetable']),
    // The deputy runs boarding day to day but cannot amend a closed register.
    'hostel.create',
    'hostel.read',
    'hostel.update',
    'hostel.export',
    'hostel.print',
    // The deputy decides student leave day to day, which is most of the queue.
    ...fullAccess(['leave']),
    ...readOnly(['teachers', 'staff', 'exams', 'notices', 'reports', 'rooms']),
    // Drafts messages and notices, but releasing a broadcast is the
    // principal's — 'communication.approve' is deliberately withheld.
    'communication.create',
    'communication.read',
    'communication.update',
    'communication.export',
  ],
  [ROLES.teacher]: [
    'students.read',
    'students.export',
    'attendance.create',
    'attendance.read',
    'attendance.update',
    'attendance.export',
    'academics.classes.read',
    'academics.subjects.read',
    'exams.create',
    'exams.read',
    'exams.update',
    'exams.print',
    // A teacher files leave — their own, and a child's when a parent sends a
    // note in — but granting it is the head's. `leave.approve` is withheld.
    'leave.create',
    'leave.read',
    'leave.update',
    // A teacher reads and prints the timetable; only the office rearranges it.
    'timetable.read',
    'timetable.print',
    'rooms.read',
    // Teachers browse the catalogue; the desk does the lending.
    'library.read',
    'notices.read',
    'reports.read',
  ],
  [ROLES.accountant]: [
    ...fullAccess(['fees']),
    // Builds salaries and costs the month, but cannot sign it off — the
    // separation the `approve` right exists for.
    'payroll.create',
    'payroll.read',
    'payroll.update',
    'payroll.delete',
    'payroll.export',
    'payroll.print',
    ...readOnly(['students']),
    'reports.read',
    'reports.export',
    'reports.print',
  ],
  [ROLES.receptionist]: [
    'students.create',
    'students.read',
    'students.update',
    'notices.create',
    'notices.read',
    // The front desk fields the "where is the bus" calls, so it reads and
    // prints transport without being able to rearrange the fleet.
    'transport.read',
    'transport.print',
    // The front desk drafts notices and messages; somebody else releases them.
    'communication.create',
    'communication.read',
    'attendance.read',
    // Parents phone the desk to report an absence, so the desk files it.
    // Deciding it is somebody else's.
    'leave.create',
    'leave.read',
  ],
  // The librarian runs the whole library, including waiving fines. Reads the
  // rosters because students and teachers are the members who borrow.
  [ROLES.librarian]: [
    ...fullAccess(['library']),
    'students.read',
    'teachers.read',
    'reports.read',
  ],
  // Staff apply for their own leave and watch it being decided.
  [ROLES.staff]: [
    'notices.read',
    'attendance.read',
    'reports.read',
    'leave.create',
    'leave.read',
  ],
  // Guardians and students read the timetable — it is most of what they open
  // the portal for — and can print it, but change nothing.
  [ROLES.parent]: [
    'students.read',
    'attendance.read',
    'fees.read',
    'exams.read',
    'notices.read',
    'timetable.read',
    'timetable.print',
    // Guardians watch the bus on the morning run — read only, and only that.
    'transport.read',
    // And whether their child was in the building last night.
    'hostel.read',
    // A guardian asks for their child's leave; the school grants it.
    'leave.create',
    'leave.read',
  ],
  [ROLES.student]: [
    'attendance.read',
    'exams.read',
    'notices.read',
    'library.read',
    'timetable.read',
    'timetable.print',
    'leave.read',
  ],
};

const ROLE_USER_COUNTS: Record<string, number> = {
  [ROLES.superAdmin]: 1,
  [ROLES.schoolAdmin]: 3,
  [ROLES.principal]: 1,
  [ROLES.vicePrincipal]: 2,
  [ROLES.teacher]: 48,
  [ROLES.accountant]: 4,
  [ROLES.receptionist]: 3,
  [ROLES.librarian]: 2,
  [ROLES.staff]: 17,
  [ROLES.parent]: 812,
  [ROLES.student]: 940,
};

export const roles: RoleDetail[] = Object.values(ROLES).map((slug, index) => ({
  id: index + 1,
  name: slug,
  guard_name: 'web',
  is_system: true,
  users_count: ROLE_USER_COUNTS[slug] ?? 0,
  permissions_count: ROLE_PERMISSION_SETS[slug]?.length ?? 0,
  permissions: ROLE_PERMISSION_SETS[slug] ?? [],
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-01-01T00:00:00.000000Z',
}));

/** Strip the permission list — the index endpoint returns counts only. */
export const toRoleSummary = ({ permissions: _permissions, ...role }: RoleDetail): Role => role;

export interface MockAccount {
  password: string;
  user: AuthUser;
}

const account = (id: number, name: string, email: string, role: string): MockAccount => ({
  password: 'Password123',
  user: {
    id,
    name,
    email,
    phone: null,
    avatar_url: null,
    email_verified_at: '2024-01-01T00:00:00.000000Z',
    roles: [role],
    // Spatie exposes the effective permission set on the user resource.
    permissions: ROLE_PERMISSION_SETS[role] ?? [],
    created_at: '2024-01-01T00:00:00.000000Z',
  },
});

/**
 * Sign-in accounts. Every one uses the password `Password123`.
 * Shown on the login screen in development.
 */
export const accounts: MockAccount[] = [
  account(1, 'Super Admin', 'superadmin@school.test', ROLES.superAdmin),
  account(2, 'Meera Iyer', 'admin@school.test', ROLES.schoolAdmin),
  account(3, 'Rajesh Kumar', 'principal@school.test', ROLES.principal),
  account(4, 'Anita Desai', 'viceprincipal@school.test', ROLES.vicePrincipal),
  account(5, 'Sunil Verma', 'teacher@school.test', ROLES.teacher),
  account(6, 'Priya Nair', 'accountant@school.test', ROLES.accountant),
  account(7, 'Kavita Joshi', 'receptionist@school.test', ROLES.receptionist),
  account(8, 'Arun Menon', 'librarian@school.test', ROLES.librarian),
  account(9, 'Deepak Rao', 'staff@school.test', ROLES.staff),
  account(10, 'Sanjay Gupta', 'parent@school.test', ROLES.parent),
  account(11, 'Ishaan Sharma', 'student@school.test', ROLES.student),
];

export const SHARED_PASSWORD = 'Password123';

// --- school settings --------------------------------------------------------

export const academicYears: AcademicYear[] = [
  {
    id: 1,
    name: '2023-2024',
    start_date: '2023-04-01',
    end_date: '2024-03-31',
    is_current: false,
    created_at: '2023-03-01T00:00:00.000000Z',
  },
  {
    id: 2,
    name: '2024-2025',
    start_date: '2024-04-01',
    end_date: '2025-03-31',
    is_current: false,
    created_at: '2024-03-01T00:00:00.000000Z',
  },
  {
    id: 3,
    name: '2025-2026',
    start_date: '2025-04-01',
    end_date: '2026-03-31',
    is_current: true,
    created_at: '2025-03-01T00:00:00.000000Z',
  },
];

/**
 * Secrets are held separately and never leave through the API — the settings
 * resource only reports whether one is stored, exactly like the real backend.
 */
export const secrets = {
  smtpPassword: 'seeded-smtp-password',
  smsApiKey: '',
};

export const settings: SchoolSettings = {
  profile: {
    name: 'Greenwood International School',
    code: 'GIS',
    email: 'office@greenwood.edu',
    phone: '+91 80 4567 8900',
    website: 'https://greenwood.edu',
    motto: 'Learn. Lead. Serve.',
    established_year: 1998,
    principal_name: 'Rajesh Kumar',
  },
  address: {
    line1: '42 Hosur Main Road',
    line2: 'Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560095',
    country: 'India',
  },
  localization: {
    timezone: 'Asia/Kolkata',
    locale: 'en-IN',
    date_format: 'd M Y',
    currency_code: 'INR',
    currency_symbol: '₹',
    currency_position: 'prefix',
    currency_decimals: 2,
  },
  email: {
    enabled: true,
    host: 'smtp.mailgun.org',
    port: 587,
    encryption: 'tls',
    username: 'postmaster@greenwood.edu',
    has_password: true,
    from_address: 'noreply@greenwood.edu',
    from_name: 'Greenwood International School',
  },
  sms: {
    enabled: false,
    provider: 'msg91',
    sender_id: 'GRNWD',
    // Deliberately unset, so the "no API key stored" warning is visible.
    has_api_key: false,
    endpoint: null,
  },
  logo_url: null,
  current_academic_year: academicYears.find((year) => year.is_current) ?? null,
  updated_at: '2025-06-01T09:30:00.000000Z',
};
