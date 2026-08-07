import {
  BookOpenCheck,
  Banknote,
  CalendarCheck,
  GraduationCap,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { PATHS } from '@/app/router/paths';
import type { Option } from '@/types/common';

import type { ReportFamily, ReportKey, ReportParam } from './types';

/**
 * `export` is separate from `read` because a report on screen and a
 * spreadsheet of nine hundred students leaving the building are different
 * acts. `print` covers the PDF, which schools file.
 */
export const REPORT_PERMISSIONS = {
  read: 'reports.read',
  export: 'reports.export',
  print: 'reports.print',
} as const;

export interface FamilyDefinition {
  key: ReportFamily;
  label: string;
  description: string;
  icon: LucideIcon;
  /** The module that owns this data. Reports summarise it; it lives there. */
  ownerPath: string;
  ownerLabel: string;
}

export const REPORT_FAMILIES: FamilyDefinition[] = [
  {
    key: 'attendance',
    label: 'Attendance',
    description: 'Who is turning up, by class and over time.',
    icon: CalendarCheck,
    ownerPath: PATHS.attendance,
    ownerLabel: 'Attendance module',
  },
  {
    key: 'fees',
    label: 'Fees',
    description: 'What has been collected, and what has not.',
    icon: Wallet,
    ownerPath: PATHS.fees,
    ownerLabel: 'Fees module',
  },
  {
    key: 'students',
    label: 'Students',
    description: 'Strength on the roll and how it got there.',
    icon: GraduationCap,
    ownerPath: PATHS.students,
    ownerLabel: 'Student register',
  },
  {
    key: 'teachers',
    label: 'Teachers',
    description: 'The teaching roster and how the week falls on it.',
    icon: Users,
    ownerPath: PATHS.teachers,
    ownerLabel: 'Teacher register',
  },
  {
    key: 'payroll',
    label: 'Payroll',
    description: 'What the school pays out, month by month.',
    icon: Banknote,
    ownerPath: PATHS.payroll,
    ownerLabel: 'Payroll module',
  },
  {
    key: 'exams',
    label: 'Examinations',
    description: 'How an exam went, by subject and by grade.',
    icon: BookOpenCheck,
    ownerPath: PATHS.exams,
    ownerLabel: 'Examinations module',
  },
];

export const FAMILY_KEYS = REPORT_FAMILIES.map((family) => family.key);

export const isReportFamily = (value: string | undefined): value is ReportFamily =>
  value !== undefined && (FAMILY_KEYS as string[]).includes(value);

export const familyOf = (key: ReportFamily) =>
  REPORT_FAMILIES.find((family) => family.key === key)!;

export interface ReportDefinition {
  key: ReportKey;
  family: ReportFamily;
  title: string;
  /** What question it answers, in the words somebody would ask it. */
  description: string;
  params: ReportParam[];
  /** Only `print` on top of `read` — the PDF is the filed copy. */
  needsPrint?: boolean;
}

/**
 * The catalogue.
 *
 * Deliberately a **frontend** registry rather than something the API returns:
 * it describes the *screen* — which filter controls to draw and what the
 * report is called — while the API owns the numbers. A report the backend
 * cannot run simply returns an empty result with a reason, which is a better
 * failure than a catalogue the two ends can disagree about.
 */
export const REPORT_CATALOGUE: ReportDefinition[] = [
  {
    key: 'attendance-by-class',
    family: 'attendance',
    title: 'Attendance by class',
    description: 'Which classes are turning up and which are not, for one month.',
    params: ['month'],
  },
  {
    key: 'attendance-trend',
    family: 'attendance',
    title: 'Attendance trend',
    description: 'The school’s attendance month by month across a year.',
    params: ['year', 'class'],
  },
  {
    key: 'fee-collection',
    family: 'fees',
    title: 'Collection trend',
    description: 'Billed against collected, month by month.',
    params: ['year'],
  },
  {
    key: 'fee-defaulters',
    family: 'fees',
    title: 'Outstanding by class',
    description: 'Where the unpaid fees actually are.',
    params: ['class'],
  },
  {
    key: 'student-strength',
    family: 'students',
    title: 'Strength by class',
    description: 'How many are on the roll, and the gender split in each class.',
    params: [],
  },
  {
    key: 'student-admissions',
    family: 'students',
    title: 'Admissions',
    description: 'Admissions month by month, and where they landed.',
    params: ['year'],
  },
  {
    key: 'teacher-departments',
    family: 'teachers',
    title: 'Teachers by department',
    description: 'How the teaching roster divides, and who is where.',
    params: [],
  },
  {
    key: 'teacher-workload',
    family: 'teachers',
    title: 'Teaching load',
    description: 'Periods a week per teacher — who is carrying the timetable.',
    params: [],
  },
  {
    key: 'payroll-cost',
    family: 'payroll',
    title: 'Salary cost',
    description: 'Gross, deductions and net paid out each month.',
    params: ['year'],
  },
  {
    key: 'payroll-statutory',
    family: 'payroll',
    title: 'PF and ESI',
    description: 'Statutory contributions per month, as the returns report them.',
    params: ['year'],
  },
  {
    key: 'exam-performance',
    family: 'exams',
    title: 'Subject performance',
    description: 'Pass rate and average by subject for one exam.',
    params: ['exam'],
    needsPrint: true,
  },
  {
    key: 'exam-grade-spread',
    family: 'exams',
    title: 'Grade spread',
    description: 'How an exam’s grades fell across the cohort.',
    params: ['exam', 'class'],
    needsPrint: true,
  },
];

export const reportsOf = (family: ReportFamily) =>
  REPORT_CATALOGUE.filter((report) => report.family === family);

export const findReport = (key: string | undefined) =>
  REPORT_CATALOGUE.find((report) => report.key === key) ?? null;

// --- parameters -------------------------------------------------------------

export const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTH_OPTIONS: Option<number>[] = MONTH_LABELS.map((label, index) => ({
  label,
  value: index + 1,
}));

/** Short axis labels — a chart of twelve months has no room for "September". */
export const MONTH_SHORT = MONTH_LABELS.map((label) => label.slice(0, 3));

/** Six years back is further than any school asks and shorter than any list needs paging. */
export const yearOptions = (): Option<number>[] =>
  Array.from({ length: 6 }, (_, index) => {
    const year = new Date().getFullYear() - index;
    return { label: String(year), value: year };
  });

export const EMPLOYEE_TYPE_OPTIONS: Option<string>[] = [
  { label: 'Teachers', value: 'teacher' },
  { label: 'Staff', value: 'staff' },
];

export const EXPORT_FORMATS = ['pdf', 'excel'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/** Below this, an attendance figure is worth flagging rather than merely reporting. */
export const ATTENDANCE_CONCERN_PERCENT = 75;

/** A teacher above this many periods a week is over the usual ceiling. */
export const HEAVY_LOAD_PERIODS = 30;
