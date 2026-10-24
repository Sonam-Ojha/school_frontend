import {
  BedDouble,
  BookOpenCheck,
  Bus,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  FileSpreadsheet,
  GraduationCap,
  HardHat,
  Library,
  Megaphone,
  ReceiptIndianRupee,
  TriangleAlert,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { ROLES } from '@/types/auth';

import type { ActivityKind, DashboardView, StatIcon } from './types';

/**
 * Which dashboard a role opens on.
 *
 * Order is precedence, mirroring `ROLES` — a head who also teaches gets the
 * principal's view and can switch to the teacher's, not the other way round.
 *
 * The office roles all map to `admin`, and that is not a shortcut: every card
 * on it is permission-filtered by the API, so an accountant's admin dashboard
 * is a finance dashboard and a librarian's is a library one. Inventing a
 * sixth view per job title would be five more places to add a card to.
 */
export const VIEW_FOR_ROLE: ReadonlyArray<readonly [role: string, view: DashboardView]> = [
  [ROLES.superAdmin, 'admin'],
  [ROLES.schoolAdmin, 'admin'],
  [ROLES.principal, 'principal'],
  [ROLES.vicePrincipal, 'principal'],
  [ROLES.academicCoordinator, 'principal'],
  [ROLES.examCoordinator, 'admin'],
  [ROLES.classTeacher, 'teacher'],
  [ROLES.teacher, 'teacher'],
  [ROLES.accountant, 'admin'],
  [ROLES.hrManager, 'admin'],
  [ROLES.receptionist, 'admin'],
  [ROLES.librarian, 'admin'],
  [ROLES.transportManager, 'admin'],
  [ROLES.hostelWarden, 'admin'],
  [ROLES.staff, 'admin'],
  [ROLES.parent, 'parent'],
  [ROLES.student, 'student'],
];

export const VIEW_LABELS: Record<DashboardView, string> = {
  admin: 'Administration',
  principal: 'Principal',
  teacher: 'Teaching',
  student: 'Student',
  parent: 'Parent',
};

/** Resolved locally too, so the shell can render before the API answers. */
export function viewForRoles(roles: string[]): DashboardView {
  return VIEW_FOR_ROLE.find(([role]) => roles.includes(role))?.[1] ?? 'admin';
}

export const STAT_ICONS: Record<StatIcon, LucideIcon> = {
  students: GraduationCap,
  teachers: Users,
  staff: HardHat,
  attendance: CalendarCheck,
  money: Wallet,
  outstanding: ReceiptIndianRupee,
  exam: FileSpreadsheet,
  homework: BookOpenCheck,
  timetable: CalendarClock,
  leave: CalendarOff,
  library: Library,
  transport: Bus,
  notice: Megaphone,
};

export const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  admission: GraduationCap,
  payment: ReceiptIndianRupee,
  leave: CalendarOff,
  exam: FileSpreadsheet,
  homework: BookOpenCheck,
  notice: Megaphone,
  library: Library,
  payroll: Wallet,
  transport: Bus,
};

/** Fallback where a module sends a kind this build does not know about yet. */
export const FALLBACK_ACTIVITY_ICON = BedDouble;
export const ALERT_ICON = TriangleAlert;

/** How long a dashboard stays fresh. Short — it is a "right now" screen. */
export const DASHBOARD_STALE_TIME = 60_000;

/** Rows a list widget shows before it stops being a preview. */
export const LIST_PREVIEW_SIZE = 6;

/** Entries in the activity feed. Past this it is a log, not a feed. */
export const ACTIVITY_FEED_SIZE = 12;
