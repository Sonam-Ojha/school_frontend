import type { Option, ToneName } from '@/types/common';

import type { AssignmentStatus, AssignmentType, SubmissionStatus } from './types';

export const ASSIGNMENT_PERMISSIONS = {
  read: 'assignments.read',
  create: 'assignments.create',
  update: 'assignments.update',
  delete: 'assignments.delete',
  /** Scoring a submission against the rubric. */
  evaluate: 'assignments.approve',
  /** Releasing evaluated marks to students — deliberately not the same right. */
  publishMarks: 'assignments.print',
  export: 'assignments.export',
} as const;

// --- assignment -------------------------------------------------------------

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  project: 'Project',
  essay: 'Essay',
  lab_report: 'Lab report',
  presentation: 'Presentation',
  case_study: 'Case study',
  practical: 'Practical',
};

export const ASSIGNMENT_TYPE_OPTIONS: Option<AssignmentType>[] = (
  ['project', 'essay', 'lab_report', 'presentation', 'case_study', 'practical'] as const
).map((value) => ({ label: ASSIGNMENT_TYPE_LABELS[value], value }));

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
};

export const ASSIGNMENT_STATUS_TONES: Record<AssignmentStatus, ToneName> = {
  draft: 'neutral',
  published: 'success',
  closed: 'info',
};

export const ASSIGNMENT_STATUS_OPTIONS: Option<AssignmentStatus>[] = (
  ['draft', 'published', 'closed'] as const
).map((value) => ({ label: ASSIGNMENT_STATUS_LABELS[value], value }));

// --- submissions ------------------------------------------------------------

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Not handed in',
  submitted: 'Submitted',
  late: 'Late',
  under_review: 'Under review',
  evaluated: 'Evaluated',
  returned: 'Returned for revision',
};

export const SUBMISSION_STATUS_TONES: Record<SubmissionStatus, ToneName> = {
  pending: 'neutral',
  submitted: 'info',
  late: 'warning',
  under_review: 'info',
  evaluated: 'success',
  returned: 'warning',
};

export const SUBMISSION_STATUS_OPTIONS: Option<SubmissionStatus>[] = (
  ['pending', 'submitted', 'late', 'under_review', 'evaluated', 'returned'] as const
).map((value) => ({ label: SUBMISSION_STATUS_LABELS[value], value }));

// --- marks ------------------------------------------------------------------

// The grade scale is the school's, not this module's — examinations and
// report cards read the same bands. See `lib/grading.ts`.
export { GRADE_BANDS, PASS_PERCENT, gradeFor, toneForGrade } from '@/lib/grading';

// --- limits -----------------------------------------------------------------

/** An assignment brief with more than this becomes unreadable on a phone. */
export const MAX_ATTACHMENTS = 10;

/** Files one student may attach to their own submission. */
export const MAX_SUBMISSION_ATTACHMENTS = 5;

export const MAX_ASSIGNMENT_MARKS = 500;

/** More criteria than this and the marking screen stops being usable. */
export const MAX_RUBRIC_CRITERIA = 10;
