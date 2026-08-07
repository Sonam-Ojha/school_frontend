import type { Option, ToneName } from '@/types/common';

import type { Shift } from './types';

/**
 * Permissions gating this module.
 *
 * Sections are governed by their class's permissions — a section has no
 * meaning apart from the class it belongs to, so a separate set would only be
 * something else to keep in step.
 */
export const CLASS_PERMISSIONS = {
  read: 'academics.classes.read',
  create: 'academics.classes.create',
  update: 'academics.classes.update',
  delete: 'academics.classes.delete',
} as const;

export const SUBJECT_PERMISSIONS = {
  read: 'academics.subjects.read',
  create: 'academics.subjects.create',
  update: 'academics.subjects.update',
  delete: 'academics.subjects.delete',
} as const;

export const SHIFT_OPTIONS: Option<Shift>[] = [
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
];

export const SHIFT_LABELS: Record<Shift, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export const SHIFT_TONES: Record<Shift, ToneName> = {
  morning: 'info',
  afternoon: 'warning',
  evening: 'neutral',
};

/** Occupancy above this share of capacity is worth flagging before it fills. */
export const NEARLY_FULL_RATIO = 0.9;

/** A room cannot hold an unbounded number of students. */
export const MAX_SECTION_CAPACITY = 200;

/** Highest class level a school is likely to run (post-graduate is not school). */
export const MAX_CLASS_LEVEL = 15;

/** Bounds for a subject's marks scheme and credit weighting. */
export const MAX_COMPONENT_MARKS = 500;
export const MAX_CREDITS = 20;
