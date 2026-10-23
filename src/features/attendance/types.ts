/**
 * Attendance for students, teachers and non-teaching staff.
 *
 * The three share one sheet shape — only who fills the rows differs — so the
 * marking screen, the monthly report and the summary are written once and
 * parameterised by `AttendanceType`.
 */

export type AttendanceType = 'student' | 'teacher' | 'staff';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave';

/**
 * Where a mark came from.
 *
 * Recorded on every entry so a QR or biometric capture can be told apart from
 * a manual one — the "ready" half of QR and biometric support is that nothing
 * downstream has to care which it was.
 */
export type AttendanceSource = 'manual' | 'qr' | 'biometric' | 'import' | 'leave';

export type HolidayType = 'public' | 'school' | 'vacation' | 'exam';

/** Who a holiday applies to — staff often work through student vacations. */
export type HolidayScope = 'all' | 'students' | 'employees';

export interface Holiday {
  id: number;
  name: string;
  /** Inclusive range. A single-day holiday has the same start and end. */
  start_date: string;
  end_date: string;
  type: HolidayType;
  scope: HolidayScope;
  description: string | null;
  /** Days covered, computed by the API. */
  days_count: number;
  created_at: string;
}

/** An approved leave covering the sheet's date, sourced from the leave module. */
export interface LeaveRef {
  id: number;
  type: string;
  reason: string | null;
  from_date: string;
  to_date: string;
}

export interface AttendanceEntry {
  person_id: number;
  person_name: string;
  /** Admission number for students, employee ID for teachers and staff. */
  identifier: string;
  photo_url: string | null;
  /** Class and section, for student sheets only. */
  group_label: string | null;

  /** `null` means not yet marked — distinct from being marked absent. */
  status: AttendanceStatus | null;
  source: AttendanceSource | null;
  check_in_at: string | null;
  check_out_at: string | null;
  remarks: string | null;

  /**
   * Set when an approved leave covers this date. The row is pre-filled as
   * `leave` and locked — attendance must not contradict an approved leave.
   */
  leave: LeaveRef | null;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  half_day: number;
  leave: number;
  unmarked: number;
  total: number;
}

export interface AttendanceSheet {
  date: string;
  type: AttendanceType;
  class_id: number | null;
  section_id: number | null;
  /** Non-null when the date falls inside a holiday that applies to this group. */
  holiday: Holiday | null;
  /**
   * Sheets lock for reasons the UI must explain rather than silently disable:
   * a holiday, a future date, or a period already finalised.
   */
  is_locked: boolean;
  lock_reason: string | null;
  entries: AttendanceEntry[];
  summary: AttendanceSummary;
}

/** One person's month, as a day-by-day strip plus totals. */
export interface MonthlyReportRow {
  person_id: number;
  person_name: string;
  identifier: string;
  group_label: string | null;
  /** Keyed by day of month (`1`–`31`). Missing days were not working days. */
  days: Record<number, AttendanceStatus | null>;
  present_days: number;
  absent_days: number;
  leave_days: number;
  late_days: number;
  /** Days the school actually operated for this person. */
  working_days: number;
  attendance_percent: number;
}

export interface MonthlyReport {
  year: number;
  /** 1–12. */
  month: number;
  type: AttendanceType;
  working_days: number;
  /** Days of the month that were holidays or weekends, for the grid header. */
  non_working_days: number[];
  rows: MonthlyReportRow[];
}

// --- capture devices --------------------------------------------------------

export type DeviceStatus = 'online' | 'offline' | 'syncing' | 'error';

export interface BiometricDevice {
  id: number;
  name: string;
  serial_number: string;
  location: string | null;
  status: DeviceStatus;
  last_sync_at: string | null;
  /** Entries pulled in on the last successful sync. */
  last_sync_count: number;
  error_message: string | null;
  /**
   * Numbers that scanned at this reader and belong to nobody on a roster —
   * usually somebody enrolled on the device under a number that is not their
   * admission number or employee ID.
   */
  unknown_ids?: string[];
}

/**
 * A reader just registered, or just given a new key. The key is what the
 * reader signs its scans with; the API returns it this once and never again.
 */
export interface RegisteredDevice extends BiometricDevice {
  push_key?: string;
}

/** What checking in with a scanned code did. */
export interface CheckInResult {
  person_name: string;
  status: AttendanceStatus;
  /** When the scan was recorded; null for a mark somebody made by hand. */
  checked_in_at: string | null;
  /** True when the person had already been marked for the day. */
  already_marked: boolean;
  date: string;
}

/**
 * A short-lived QR code students scan to check themselves in.
 *
 * The token is signed by the backend and the image is rendered there too —
 * a client-side code could be screenshotted and reused, which is exactly what
 * the expiry is for.
 */
export interface QrSession {
  id: number;
  type: AttendanceType;
  class_id: number | null;
  section_id: number | null;
  date: string;
  token: string;
  /** Absolute URL a scanner opens. */
  check_in_url: string;
  expires_at: string;
  is_active: boolean;
  checked_in_count: number;
  expected_count: number;
}
