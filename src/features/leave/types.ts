import type { AttendanceType } from '@/features/attendance/types';

/**
 * Leave.
 *
 * Two records. A **leave type** is a kind of absence the school recognises —
 * casual, sick, earned — with the rules that go with it. An **application**
 * is one person asking for some, and the approval that did or did not follow.
 *
 * Applicants are not a record here: students, teachers and staff are three
 * rosters that already exist, and the discriminator is the attendance
 * module's own `AttendanceType`, imported rather than restated. That is not a
 * coincidence — a person on approved leave is exactly the person whose
 * attendance row is locked, and the two modules have to agree about who that
 * is.
 */
export type ApplicantType = AttendanceType;

/**
 * `withdrawn` is the applicant changing their mind before a decision;
 * `cancelled` is a decision being undone afterwards. They read the same to a
 * casual glance and mean quite different things in a dispute.
 */
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'withdrawn';

/** Half days are ordinary — a dental appointment is not a day off. */
export type DayPortion = 'full' | 'first_half' | 'second_half';

export interface LeaveType {
  id: number;
  name: string;
  /** Short code on the register — `CL`, `SL`. */
  code: string;
  /**
   * Who may apply for it. A maternity type that students could request would
   * be a picker full of nonsense.
   */
  applies_to: ApplicantType[];

  /**
   * Days a year. Null for a type with no entitlement behind it — students
   * have no leave balance, they simply ask.
   */
  annual_quota: number | null;
  is_paid: boolean;
  /** A medical certificate, say. Advisory here; the API records whether one came. */
  requires_document: boolean;
  /**
   * Whether it may be applied for after the fact.
   *
   * Sick leave almost always is — nobody files a request before falling ill —
   * and casual leave almost never should be.
   */
  allows_backdated: boolean;
  /** Longest single stretch, or null for no limit. */
  max_consecutive_days: number | null;

  is_active: boolean;
  /** Applications using it — a delete guard. */
  applications_count: number;
  created_at: string;
}

export interface LeaveApplication {
  id: number;

  applicant_type: ApplicantType;
  applicant_id: number;
  applicant_name: string;
  /** Admission number for a student, employee id for everybody else. */
  applicant_identifier: string;
  photo_url: string | null;
  /** Class and section, or designation — whichever the roster carries. */
  applicant_detail: string | null;

  leave_type_id: number;
  leave_type_name: string;
  leave_type_code: string;
  is_paid: boolean;

  from_date: string;
  to_date: string;
  day_portion: DayPortion;
  /**
   * Working days actually consumed.
   *
   * Holidays and weekends are excluded — the attendance module owns the
   * calendar, and leave taken over a school holiday is not leave. A half day
   * counts a half.
   */
  days: number;

  reason: string;
  document_name: string | null;

  status: LeaveStatus;
  applied_at: string;
  applied_by: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;

  /** True once the first day has arrived — the guard on cancelling. */
  has_started: boolean;
  /** True while it is running right now, for the "who is away" report. */
  is_current: boolean;
}

/** One leave type's standing for one person. */
export interface Entitlement {
  leave_type_id: number;
  leave_type_name: string;
  leave_type_code: string;
  /** Null for a type with no entitlement — students, and unpaid leave. */
  quota: number | null;
  taken: number;
  /**
   * Days sitting in undecided applications.
   *
   * Counted against the balance on purpose: without it somebody could apply
   * for thirty days across ten requests and every one would look affordable.
   */
  pending: number;
  /** `quota - taken - pending`. Null when there is no quota to draw down. */
  available: number | null;
}

export interface LeaveBalance {
  /**
   * `"{type}-{id}"` — a row key, not a record id.
   *
   * A balance is derived rather than stored, and the three rosters are three
   * separate id spaces: student 7 and teacher 7 are different people.
   */
  id: string;
  applicant_type: ApplicantType;
  applicant_id: number;
  applicant_name: string;
  applicant_identifier: string;
  photo_url: string | null;
  applicant_detail: string | null;

  entitlements: Entitlement[];
  total_quota: number;
  total_taken: number;
  total_pending: number;
  total_available: number;
}

// --- reports ----------------------------------------------------------------

/** One row of the usage report — who took how much of what. */
export interface LeaveUsageRow {
  applicant_type: ApplicantType;
  applicant_id: number;
  applicant_name: string;
  applicant_identifier: string;
  applicant_detail: string | null;
  /** Days taken per leave type, keyed by code. */
  by_type: Record<string, number>;
  total_days: number;
  applications: number;
  /** Approved days that fell on a working day and were unpaid. */
  unpaid_days: number;
}

export interface LeaveReport {
  from_date: string;
  to_date: string;
  applicant_type: ApplicantType | null;
  /** The leave-type columns the rows are keyed by, in a stable order. */
  columns: { code: string; name: string }[];
  rows: LeaveUsageRow[];
  totals: {
    people: number;
    applications: number;
    days: number;
    unpaid_days: number;
    by_type: Record<string, number>;
  };
}

/** Somebody away right now — the question a school actually asks each morning. */
export interface AwayToday {
  application_id: number;
  applicant_type: ApplicantType;
  applicant_id: number;
  applicant_name: string;
  applicant_identifier: string;
  applicant_detail: string | null;
  photo_url: string | null;
  leave_type_name: string;
  day_portion: DayPortion;
  from_date: string;
  to_date: string;
  /** Days of this leave still to run, including today. */
  days_remaining: number;
}

export interface LeaveSummary {
  pending: number;
  /** Pending applications whose first day has already passed. */
  overdue_decisions: number;
  away_today: number;
  approved_this_month: number;
  /** Broken down so a head can see at a glance which roster is short-handed. */
  away_by_type: Record<ApplicantType, number>;
}
