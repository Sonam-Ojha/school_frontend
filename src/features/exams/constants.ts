import type { Option, ToneName } from '@/types/common';

import type { ExamStatus, ExamType } from './types';

export const EXAM_PERMISSIONS = {
  read: 'exams.read',
  create: 'exams.create',
  update: 'exams.update',
  delete: 'exams.delete',
  /** Entering marks — deliberately not the same right as publishing them. */
  enterMarks: 'exams.update',
  /** Releasing results to students and guardians. */
  publish: 'exams.approve',
  /** Report cards. */
  print: 'exams.print',
  export: 'exams.export',
} as const;

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  unit_test: 'Unit test',
  mid_term: 'Mid term',
  half_yearly: 'Half yearly',
  annual: 'Annual',
  pre_board: 'Pre-board',
  practical: 'Practical',
};

export const EXAM_TYPE_OPTIONS: Option<ExamType>[] = (
  ['unit_test', 'mid_term', 'half_yearly', 'annual', 'pre_board', 'practical'] as const
).map((value) => ({ label: EXAM_TYPE_LABELS[value], value }));

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  published: 'Results published',
};

export const EXAM_STATUS_TONES: Record<ExamStatus, ToneName> = {
  draft: 'neutral',
  scheduled: 'info',
  ongoing: 'warning',
  completed: 'info',
  published: 'success',
};

export const EXAM_STATUS_OPTIONS: Option<ExamStatus>[] = (
  ['draft', 'scheduled', 'ongoing', 'completed', 'published'] as const
).map((value) => ({ label: EXAM_STATUS_LABELS[value], value }));

/** Common paper lengths, offered as a shortcut on the schedule form. */
export const DURATION_OPTIONS: Option<number>[] = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1½ hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '2½ hours', value: 150 },
  { label: '3 hours', value: 180 },
];

/** Bounds that keep a typo out of the marks ledger. */
export const MAX_PAPER_MARKS = 500;
export const MAX_DURATION_MINUTES = 360;

/** Below this share of papers marked, a result is not worth computing. */
export const MIN_PAPERS_FOR_RESULT = 1;
