import type { Option, ToneName } from '@/types/common';

import type {
  AttendanceSource,
  AttendanceStatus,
  AttendanceType,
  DeviceStatus,
  HolidayScope,
  HolidayType,
} from './types';

export const ATTENDANCE_PERMISSIONS = {
  read: 'attendance.read',
  create: 'attendance.create',
  update: 'attendance.update',
  export: 'attendance.export',
  approve: 'attendance.approve',
} as const;

export const HOLIDAY_PERMISSIONS = {
  read: 'holidays.read',
  create: 'holidays.create',
  update: 'holidays.update',
  delete: 'holidays.delete',
} as const;

export const ATTENDANCE_TYPE_LABELS: Record<AttendanceType, string> = {
  student: 'Students',
  teacher: 'Teachers',
  staff: 'Staff',
};

// --- status -----------------------------------------------------------------

/** Order matters: this is the order the marking buttons appear in. */
export const STATUS_OPTIONS: Option<AttendanceStatus>[] = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Late', value: 'late' },
  { label: 'Half day', value: 'half_day' },
  { label: 'Leave', value: 'leave' },
];

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half day',
  leave: 'Leave',
};

/** Single letters for the monthly grid, where a column is ~1.5rem wide. */
export const STATUS_INITIALS: Record<AttendanceStatus, string> = {
  present: 'P',
  absent: 'A',
  late: 'L',
  half_day: 'H',
  leave: 'V',
};

export const STATUS_TONES: Record<AttendanceStatus, ToneName> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  half_day: 'info',
  leave: 'neutral',
};

/** Grid cell colours. Kept apart from badge tones — these must read at 1.5rem. */
export const STATUS_CELL_CLASSES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100 text-emerald-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-amber-100 text-amber-800',
  half_day: 'bg-brand-100 text-brand-800',
  leave: 'bg-slate-200 text-slate-700',
};

/** Statuses that count toward the attendance percentage. */
export const PRESENT_EQUIVALENT: readonly AttendanceStatus[] = ['present', 'late'];

// --- source -----------------------------------------------------------------

export const SOURCE_LABELS: Record<AttendanceSource, string> = {
  manual: 'Marked manually',
  qr: 'QR check-in',
  biometric: 'Biometric device',
  import: 'Bulk import',
  leave: 'Approved leave',
};

export const SOURCE_SHORT_LABELS: Record<AttendanceSource, string> = {
  manual: 'Manual',
  qr: 'QR',
  biometric: 'Biometric',
  import: 'Import',
  leave: 'Leave',
};

// --- holidays ---------------------------------------------------------------

export const HOLIDAY_TYPE_OPTIONS: Option<HolidayType>[] = [
  { label: 'Public holiday', value: 'public' },
  { label: 'School holiday', value: 'school' },
  { label: 'Vacation', value: 'vacation' },
  { label: 'Examination break', value: 'exam' },
];

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  public: 'Public holiday',
  school: 'School holiday',
  vacation: 'Vacation',
  exam: 'Examination break',
};

export const HOLIDAY_TYPE_TONES: Record<HolidayType, ToneName> = {
  public: 'danger',
  school: 'info',
  vacation: 'success',
  exam: 'warning',
};

export const HOLIDAY_SCOPE_OPTIONS: Option<HolidayScope>[] = [
  { label: 'Everyone', value: 'all' },
  { label: 'Students only', value: 'students' },
  { label: 'Employees only', value: 'employees' },
];

export const HOLIDAY_SCOPE_LABELS: Record<HolidayScope, string> = {
  all: 'Everyone',
  students: 'Students only',
  employees: 'Employees only',
};

/** A holiday spanning more than this is almost certainly a typo. */
export const MAX_HOLIDAY_DAYS = 90;

// --- devices ----------------------------------------------------------------

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  syncing: 'Syncing',
  error: 'Error',
};

export const DEVICE_STATUS_TONES: Record<DeviceStatus, ToneName> = {
  online: 'success',
  offline: 'neutral',
  syncing: 'info',
  error: 'danger',
};

export const MONTH_OPTIONS: Option<number>[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
].map((label, index) => ({ label, value: index + 1 }));
