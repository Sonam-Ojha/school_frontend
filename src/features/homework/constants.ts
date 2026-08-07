import type { Option, ToneName } from '@/types/common';

import type { HomeworkStatus, SubmissionStatus } from './types';

export const HOMEWORK_PERMISSIONS = {
  read: 'homework.read',
  create: 'homework.create',
  update: 'homework.update',
  delete: 'homework.delete',
  /** Recording marks and remarks against a submission. */
  grade: 'homework.approve',
} as const;

export const HOMEWORK_STATUS_OPTIONS: Option<HomeworkStatus>[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Closed', value: 'closed' },
];

export const HOMEWORK_STATUS_LABELS: Record<HomeworkStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
};

export const HOMEWORK_STATUS_TONES: Record<HomeworkStatus, ToneName> = {
  draft: 'neutral',
  published: 'success',
  closed: 'info',
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Not handed in',
  submitted: 'Submitted',
  late: 'Late',
  graded: 'Graded',
};

export const SUBMISSION_STATUS_TONES: Record<SubmissionStatus, ToneName> = {
  pending: 'neutral',
  submitted: 'info',
  late: 'warning',
  graded: 'success',
};

export const SUBMISSION_STATUS_OPTIONS: Option<SubmissionStatus>[] = (
  ['pending', 'submitted', 'late', 'graded'] as const
).map((value) => ({ label: SUBMISSION_STATUS_LABELS[value], value }));

// --- attachments ------------------------------------------------------------

/**
 * Upload rules live in `components/attachments` — the assignments module needs
 * the identical set, so they moved there rather than being restated. Re-exported
 * here so this module's public surface is unchanged.
 */
export {
  ACCEPTED_MIME_TYPES,
  ALL_ACCEPTED_MIME_TYPES,
  ATTACHMENT_KIND_LABELS,
  MAX_BYTES,
  kindForMime,
} from '@/components/attachments';

/** A homework brief with more than this becomes unreadable on a phone. */
export const MAX_ATTACHMENTS = 10;

export const MAX_HOMEWORK_MARKS = 500;
