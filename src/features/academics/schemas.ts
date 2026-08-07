import { z } from 'zod';

import { optionalText } from '@/lib/validation';

import {
  MAX_CLASS_LEVEL,
  MAX_COMPONENT_MARKS,
  MAX_CREDITS,
  MAX_SECTION_CAPACITY,
} from './constants';

/**
 * Class and section validation.
 *
 * Transform-free so the inferred types match what the form fields hold;
 * normalisation happens in the service.
 */

export const classSchema = z.object({
  name: z
    .string()
    .min(1, 'Class name is required')
    .max(50, 'Class name is too long')
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s.-]*$/, 'Use letters, numbers, spaces, dots and hyphens'),
  /**
   * Ordinal for sorting and promotion. Numeric input, so `valueAsNumber` gives
   * `NaN` when blank — the message covers both blank and non-numeric.
   */
  level: z
    .number({ invalid_type_error: 'Enter the class level as a number' })
    .int('Level must be a whole number')
    .min(1, 'Level must be at least 1')
    .max(MAX_CLASS_LEVEL, `Level must be at most ${MAX_CLASS_LEVEL}`),
  is_active: z.boolean(),
});

export const sectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Section name is required')
    .max(20, 'Section name is too long')
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]*$/, 'Use letters, numbers, spaces and hyphens'),
  shift: z.enum(['morning', 'afternoon', 'evening'], { invalid_type_error: 'Select a shift' }),
  capacity: z
    .number({ invalid_type_error: 'Enter a capacity' })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(MAX_SECTION_CAPACITY, `Capacity must be at most ${MAX_SECTION_CAPACITY}`),
  room: optionalText(30, 'Room name is too long'),
  is_active: z.boolean(),
});

/**
 * Subject validation.
 *
 * Marks are typed as strings because their fields are hidden when the
 * component is switched off — a hidden numeric input holds `NaN`, which would
 * fail `z.number()` even though the value is irrelevant. The rules below only
 * look at a component's marks when that component is enabled; the service
 * converts to numbers (or null) on the way out.
 */
const marksField = z.string();

/** Reads a marks field, treating anything unparseable as absent. */
const readMarks = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

function validateComponent(
  ctx: z.RefinementCtx,
  enabled: boolean,
  maxRaw: string,
  passRaw: string,
  label: string,
  maxPath: string,
  passPath: string,
) {
  if (!enabled) return;

  const max = readMarks(maxRaw);
  const pass = readMarks(passRaw);

  if (max === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [maxPath], message: `${label} maximum marks are required` });
  } else if (!Number.isInteger(max) || max < 1 || max > MAX_COMPONENT_MARKS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [maxPath],
      message: `Enter a whole number between 1 and ${MAX_COMPONENT_MARKS}`,
    });
  }

  if (pass === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [passPath], message: `${label} pass marks are required` });
  } else if (!Number.isInteger(pass) || pass < 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [passPath], message: 'Enter a whole number' });
  } else if (max !== null && pass > max) {
    // A pass mark above the maximum can never be reached.
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [passPath],
      message: 'Pass marks cannot exceed the maximum',
    });
  }
}

export const subjectSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Subject name is required')
      .max(100, 'Subject name is too long')
      .regex(/^[A-Za-z][A-Za-z0-9\s&.()-]*$/, 'Use letters, numbers, spaces and & . ( ) -'),
    code: z
      .string()
      .min(2, 'Subject code is required')
      .max(15, 'Subject code is too long')
      .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),

    has_theory: z.boolean(),
    theory_max_marks: marksField,
    theory_pass_marks: marksField,

    has_practical: z.boolean(),
    practical_max_marks: marksField,
    practical_pass_marks: marksField,

    credits: z
      .number({ invalid_type_error: 'Enter the credits as a number' })
      .min(0, 'Credits cannot be negative')
      .max(MAX_CREDITS, `Credits must be at most ${MAX_CREDITS}`),
    is_elective: z.boolean(),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // A subject with neither component cannot be examined at all.
    if (!data.has_theory && !data.has_practical) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['has_theory'],
        message: 'A subject must have a theory component, a practical component, or both',
      });
    }

    validateComponent(
      ctx,
      data.has_theory,
      data.theory_max_marks,
      data.theory_pass_marks,
      'Theory',
      'theory_max_marks',
      'theory_pass_marks',
    );

    validateComponent(
      ctx,
      data.has_practical,
      data.practical_max_marks,
      data.practical_pass_marks,
      'Practical',
      'practical_max_marks',
      'practical_pass_marks',
    );
  });

export const assignTeachersSchema = z.object({
  teacher_ids: z.array(z.number()),
});

export type ClassInput = z.infer<typeof classSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type AssignTeachersInput = z.infer<typeof assignTeachersSchema>;

/** Shared with the service so marks are parsed identically everywhere. */
export { readMarks };

/**
 * Capacity cannot be cut below the number of students already enrolled —
 * the seats are taken. Applied as a superRefine at the form level because the
 * enrolled count lives on the record, not in the form.
 */
export function sectionSchemaFor(enrolled: number) {
  return sectionSchema.refine((data) => data.capacity >= enrolled, {
    message:
      enrolled === 1
        ? 'One student is already enrolled — capacity cannot be lower'
        : `${enrolled} students are already enrolled — capacity cannot be lower`,
    path: ['capacity'],
  });
}
