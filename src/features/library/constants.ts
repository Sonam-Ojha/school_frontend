import type { Option, ToneName } from '@/types/common';

import type { CopyCondition, CopyStatus, LoanStatus, MemberType } from './types';

/**
 * `approve` is the waiver right — writing off a fine is a decision, and
 * routinely one a desk assistant may not take. `print` covers barcode labels
 * and spine stickers.
 */
export const LIBRARY_PERMISSIONS = {
  read: 'library.read',
  create: 'library.create',
  update: 'library.update',
  delete: 'library.delete',
  export: 'library.export',
  print: 'library.print',
  waiveFine: 'library.approve',
} as const;

// --- lending policy ---------------------------------------------------------

/**
 * How many books each population may hold at once, and for how long.
 *
 * A teacher keeps a book for a term; a student keeps it for a fortnight. The
 * numbers live here so the borrow check, the issue form and the member card
 * all read the same policy.
 */
export const BORROW_LIMITS: Record<MemberType, number> = {
  student: 3,
  teacher: 6,
};

export const LOAN_DAYS: Record<MemberType, number> = {
  student: 14,
  teacher: 30,
};

/** Times a loan may be pushed out before the book must come back. */
export const MAX_RENEWALS = 2;

/** Days added by a renewal — a shorter leash than the original loan. */
export const RENEWAL_DAYS = 7;

/** Charged per day past the due date, in major units. */
export const FINE_PER_DAY = 2;

/**
 * Days of grace before a fine starts.
 *
 * A library that fines somebody for being an hour late on a Monday morning
 * teaches people to avoid the library.
 */
export const FINE_GRACE_DAYS = 2;

/**
 * An overdue fine never exceeds what the book costs to replace.
 *
 * Without the cap a book forgotten for a year would attract a fine several
 * times its own price, which no library would ever actually collect.
 */
export function fineFor(daysOverdue: number, replacementPrice: number): number {
  const chargeable = Math.max(0, daysOverdue - FINE_GRACE_DAYS);
  const accrued = chargeable * FINE_PER_DAY;

  return Math.min(accrued, replacementPrice);
}

// --- labels -----------------------------------------------------------------

export const COPY_STATUS_LABELS: Record<CopyStatus, string> = {
  available: 'Available',
  issued: 'Issued',
  reserved: 'Reserved',
  lost: 'Lost',
  damaged: 'Damaged',
  withdrawn: 'Withdrawn',
};

export const COPY_STATUS_TONES: Record<CopyStatus, ToneName> = {
  available: 'success',
  issued: 'info',
  reserved: 'warning',
  lost: 'danger',
  damaged: 'danger',
  withdrawn: 'neutral',
};

export const COPY_STATUS_OPTIONS: Option<CopyStatus>[] = (
  Object.keys(COPY_STATUS_LABELS) as CopyStatus[]
).map((status) => ({ label: COPY_STATUS_LABELS[status], value: status }));

export const COPY_CONDITION_LABELS: Record<CopyCondition, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const COPY_CONDITION_OPTIONS: Option<CopyCondition>[] = (
  Object.keys(COPY_CONDITION_LABELS) as CopyCondition[]
).map((condition) => ({ label: COPY_CONDITION_LABELS[condition], value: condition }));

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  issued: 'Issued',
  returned: 'Returned',
  overdue: 'Overdue',
  lost: 'Lost',
};

export const LOAN_STATUS_TONES: Record<LoanStatus, ToneName> = {
  issued: 'info',
  returned: 'success',
  overdue: 'danger',
  lost: 'danger',
};

export const LOAN_STATUS_OPTIONS: Option<LoanStatus>[] = (
  Object.keys(LOAN_STATUS_LABELS) as LoanStatus[]
).map((status) => ({ label: LOAN_STATUS_LABELS[status], value: status }));

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  student: 'Student',
  teacher: 'Teacher',
};

export const MEMBER_TYPE_OPTIONS: Option<MemberType>[] = (
  Object.keys(MEMBER_TYPE_LABELS) as MemberType[]
).map((type) => ({ label: MEMBER_TYPE_LABELS[type], value: type }));

export const LANGUAGE_OPTIONS: Option[] = [
  'English',
  'Hindi',
  'Kannada',
  'Sanskrit',
  'Tamil',
  'Telugu',
  'French',
].map((language) => ({ label: language, value: language }));

/** Copies addable in one go — a delivery, not a data-entry marathon. */
export const MAX_COPIES_PER_BATCH = 50;

/** Barcode labels per printed sheet, at three columns. */
export const LABELS_PER_SHEET = 24;
