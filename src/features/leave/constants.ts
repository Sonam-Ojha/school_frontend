import type { Option, ToneName } from '@/types/common';

import type { ApplicantType, DayPortion, LeaveStatus } from './types';

/**
 * `approve` is the decision right, and it is deliberately separate from
 * `update`: filing somebody's leave application on their behalf is clerical,
 * granting it is not, and schools routinely give those two to different
 * people.
 */
export const LEAVE_PERMISSIONS = {
  read: 'leave.read',
  create: 'leave.create',
  update: 'leave.update',
  delete: 'leave.delete',
  export: 'leave.export',
  approve: 'leave.approve',
} as const;

// --- labels -----------------------------------------------------------------

export const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  student: 'Student',
  teacher: 'Teacher',
  staff: 'Staff',
};

export const APPLICANT_TYPE_OPTIONS: Option<ApplicantType>[] = (
  Object.keys(APPLICANT_TYPE_LABELS) as ApplicantType[]
).map((type) => ({ label: APPLICANT_TYPE_LABELS[type], value: type }));

export const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Awaiting decision',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  withdrawn: 'Withdrawn',
};

export const STATUS_TONES: Record<LeaveStatus, ToneName> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
  withdrawn: 'neutral',
};

export const STATUS_OPTIONS: Option<LeaveStatus>[] = (
  Object.keys(STATUS_LABELS) as LeaveStatus[]
).map((status) => ({ label: STATUS_LABELS[status], value: status }));

export const DAY_PORTION_LABELS: Record<DayPortion, string> = {
  full: 'Full day',
  first_half: 'First half',
  second_half: 'Second half',
};

export const DAY_PORTION_OPTIONS: Option<DayPortion>[] = (
  Object.keys(DAY_PORTION_LABELS) as DayPortion[]
).map((portion) => ({ label: DAY_PORTION_LABELS[portion], value: portion }));

/** A half day consumes half a day of entitlement. */
export const PORTION_DAYS: Record<DayPortion, number> = {
  full: 1,
  first_half: 0.5,
  second_half: 0.5,
};

// --- workflow ---------------------------------------------------------------

/**
 * What each state allows next.
 *
 * One place, so the buttons on the application screen and the guards on the
 * API cannot disagree about whether something can still be approved.
 */
export const STATUS_TRANSITIONS: Record<LeaveStatus, LeaveStatus[]> = {
  // The applicant may withdraw; a reviewer may approve or reject.
  pending: ['approved', 'rejected', 'withdrawn'],
  // An approval can be undone, but only before the leave has begun.
  approved: ['cancelled'],
  rejected: [],
  cancelled: [],
  withdrawn: [],
};

export const canTransition = (from: LeaveStatus, to: LeaveStatus): boolean =>
  STATUS_TRANSITIONS[from].includes(to);

/** Statuses that consume entitlement — pending counts, so a balance is honest. */
export const CONSUMING_STATUSES: LeaveStatus[] = ['pending', 'approved'];

/** Statuses that put somebody on the "away" list. */
export const ABSENT_STATUSES: LeaveStatus[] = ['approved'];

// --- policy -----------------------------------------------------------------

/**
 * How far back an application may be dated even when the type allows it.
 *
 * Sick leave is filed after the fact by definition, but a request dated three
 * months ago is somebody tidying up a register rather than reporting an
 * illness.
 */
export const MAX_BACKDATED_DAYS = 30;

/** A single application longer than this is worth a second look. */
export const LONG_LEAVE_DAYS = 10;

/** A balance below this share of the quota is worth flagging on the report. */
export const LOW_BALANCE_RATIO = 0.2;

export const MAX_REASON_LENGTH = 500;
