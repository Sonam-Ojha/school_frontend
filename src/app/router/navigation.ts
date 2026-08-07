import {
  Banknote,
  BedDouble,
  BookOpen,
  BookOpenCheck,
  Bus,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  ChartColumnBig,
  ChartScatter,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  HardHat,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Library,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { CLASS_PERMISSIONS, SUBJECT_PERMISSIONS } from '@/features/academics/constants';
import { ASSIGNMENT_PERMISSIONS } from '@/features/assignments/constants';
import { ATTENDANCE_PERMISSIONS } from '@/features/attendance/constants';
import { COMMUNICATION_PERMISSIONS } from '@/features/communication/constants';
import { EXAM_PERMISSIONS } from '@/features/exams/constants';
import { FEE_PERMISSIONS } from '@/features/fees/constants';
import { HOMEWORK_PERMISSIONS } from '@/features/homework/constants';
import { HOSTEL_PERMISSIONS } from '@/features/hostel/constants';
import { ANALYTICS_PERMISSIONS } from '@/features/analytics/constants';
import { LEAVE_PERMISSIONS } from '@/features/leave/constants';
import { PAYROLL_PERMISSIONS } from '@/features/payroll/constants';
import { LIBRARY_PERMISSIONS } from '@/features/library/constants';
import { REPORT_PERMISSIONS } from '@/features/reports/constants';
import { PERMISSION_PERMISSIONS, ROLE_PERMISSIONS } from '@/features/roles/constants';
import { SETTINGS_PERMISSIONS } from '@/features/settings/constants';
import { STAFF_PERMISSIONS } from '@/features/staff/constants';
import { STUDENT_PERMISSIONS } from '@/features/students/constants';
import { TEACHER_PERMISSIONS } from '@/features/teachers/constants';
import { TIMETABLE_PERMISSIONS } from '@/features/timetable/constants';
import { TRANSPORT_PERMISSIONS } from '@/features/transport/constants';

import { PATHS } from './paths';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Visible only to these roles. Empty/omitted means every signed-in user. */
  roles?: string[];
  /** Visible only with one of these Spatie permissions. */
  permissions?: string[];
}

export interface NavSection {
  /** Omit for the top-level group rendered without a heading. */
  title?: string;
  items: NavItem[];
}

/**
 * Sidebar structure. Feature modules append their entry here — this is the
 * only file that needs touching to expose a new module in the navigation.
 */
export const NAVIGATION: NavSection[] = [
  {
    items: [{ label: 'Dashboard', to: PATHS.dashboard, icon: LayoutDashboard }],
  },
  {
    title: 'People',
    items: [
      {
        label: 'Students',
        to: PATHS.students,
        icon: GraduationCap,
        permissions: [STUDENT_PERMISSIONS.read],
      },
      {
        label: 'Teachers',
        to: PATHS.teachers,
        icon: Users,
        permissions: [TEACHER_PERMISSIONS.read],
      },
      {
        label: 'Staff',
        to: PATHS.staff,
        icon: HardHat,
        permissions: [STAFF_PERMISSIONS.read],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Fees',
        to: PATHS.fees,
        icon: Wallet,
        permissions: [FEE_PERMISSIONS.read],
      },
      {
        label: 'Payroll',
        to: PATHS.payroll,
        icon: Banknote,
        permissions: [PAYROLL_PERMISSIONS.read],
      },
    ],
  },
  {
    title: 'Academics',
    items: [
      {
        label: 'Classes & sections',
        to: PATHS.classes,
        icon: LayoutGrid,
        permissions: [CLASS_PERMISSIONS.read],
      },
      {
        label: 'Subjects',
        to: PATHS.subjects,
        icon: BookOpen,
        permissions: [SUBJECT_PERMISSIONS.read],
      },
      {
        label: 'Timetable',
        to: PATHS.timetable,
        icon: CalendarClock,
        permissions: [TIMETABLE_PERMISSIONS.read],
      },
      {
        label: 'Attendance',
        to: PATHS.attendance,
        icon: CalendarCheck,
        permissions: [ATTENDANCE_PERMISSIONS.read],
      },
      // Next to attendance because that is what it changes: approved leave is
      // what locks a row on the sheet.
      {
        label: 'Leave',
        to: PATHS.leave,
        icon: CalendarOff,
        permissions: [LEAVE_PERMISSIONS.read],
      },
      {
        label: 'Homework',
        to: PATHS.homework,
        icon: BookOpenCheck,
        permissions: [HOMEWORK_PERMISSIONS.read],
      },
      {
        label: 'Assignments',
        to: PATHS.assignments,
        icon: ClipboardList,
        permissions: [ASSIGNMENT_PERMISSIONS.read],
      },
      {
        label: 'Examinations',
        to: PATHS.exams,
        icon: FileSpreadsheet,
        permissions: [EXAM_PERMISSIONS.read],
      },
      {
        label: 'Library',
        to: PATHS.library,
        icon: Library,
        permissions: [LIBRARY_PERMISSIONS.read],
      },
      {
        label: 'Transport',
        to: PATHS.transport,
        icon: Bus,
        permissions: [TRANSPORT_PERMISSIONS.read],
      },
      {
        label: 'Hostel',
        to: PATHS.hostel,
        icon: BedDouble,
        permissions: [HOSTEL_PERMISSIONS.read],
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Messages & notices',
        to: PATHS.communication,
        icon: MessageSquare,
        permissions: [COMMUNICATION_PERMISSIONS.read],
      },
    ],
  },
  // Its own section: reports read across every module above rather than
  // belonging to any one of them.
  {
    title: 'Insight',
    items: [
      {
        label: 'Reports',
        to: PATHS.reports,
        icon: ChartColumnBig,
        permissions: [REPORT_PERMISSIONS.read],
      },
      {
        label: 'Analytics',
        to: PATHS.analytics,
        icon: ChartScatter,
        permissions: [ANALYTICS_PERMISSIONS.read],
      },
    ],
  },
  {
    title: 'Access control',
    items: [
      {
        label: 'Roles',
        to: PATHS.roles,
        icon: ShieldCheck,
        permissions: [ROLE_PERMISSIONS.read],
      },
      {
        label: 'Permissions',
        to: PATHS.permissions,
        icon: KeyRound,
        permissions: [PERMISSION_PERMISSIONS.read],
      },
    ],
  },
  {
    title: 'Configuration',
    items: [
      {
        label: 'School settings',
        to: PATHS.settings,
        icon: Settings,
        permissions: [SETTINGS_PERMISSIONS.read],
      },
    ],
  },
];
