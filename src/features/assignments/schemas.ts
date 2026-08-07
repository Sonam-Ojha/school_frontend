import { z } from 'zod';

import { optionalText } from '@/lib/validation';

import { MAX_ASSIGNMENT_MARKS, MAX_RUBRIC_CRITERIA } from './constants';
import type { RubricCriterion } from './types';

/** One line of the marking scheme, as the form holds it. */
export const rubricCriterionSchema = z.object({
  /** Zero for a criterion that has not been saved yet. */
  id: z.number().int(),
  name: z.string().min(2, 'Name the criterion').max(80, 'Criterion name is too long'),
  description: optionalText(200, 'Description is too long'),
  max_marks: z
    .number({ invalid_type_error: 'Enter the marks for this criterion' })
    .min(0.5, 'A criterion must carry at least half a mark')
    .max(MAX_ASSIGNMENT_MARKS, 'That is more than the assignment is worth'),
});

export const assignmentSchema = z
  .object({
    title: z.string().min(3, 'Title is required').max(150, 'Title is too long'),
    instructions: z
      .string()
      .min(10, 'Describe what the students have to produce')
      .max(8000, 'Instructions are too long'),

    type: z.enum(['project', 'essay', 'lab_report', 'presentation', 'case_study', 'practical'], {
      required_error: 'Choose the kind of work',
    }),

    class_id: z.number({ invalid_type_error: 'Select a class' }).int().positive('Select a class'),
    /** Null means every section of the class. */
    section_id: z.number().int().positive().nullable(),
    subject_id: z
      .number({ invalid_type_error: 'Select a subject' })
      .int()
      .positive('Select a subject'),

    assigned_date: z.string().min(1, 'Assigned date is required'),
    due_date: z.string().min(1, 'Due date is required'),

    max_marks: z
      .number({ invalid_type_error: 'Enter the maximum marks' })
      .min(1, 'Maximum marks must be at least 1')
      .max(MAX_ASSIGNMENT_MARKS, `Maximum marks cannot exceed ${MAX_ASSIGNMENT_MARKS}`),

    weightage_percent: z
      .number({ invalid_type_error: 'Enter the weightage' })
      .min(0, 'Weightage cannot be negative')
      .max(100, 'Weightage cannot exceed 100%'),

    allows_late_submission: z.boolean(),
    /**
     * Only meaningful when late work is accepted. Deliberately *not* forced to
     * zero here: the field is disabled rather than cleared when the teacher
     * unticks late submission, so a rule rejecting a leftover value would fail
     * validation on a field they can no longer edit. The service sends zero
     * instead, which is where the normalisation belongs.
     */
    late_penalty_percent: z
      .number({ invalid_type_error: 'Enter the daily penalty' })
      .min(0, 'The penalty cannot be negative')
      .max(100, 'The penalty cannot exceed 100%'),

    rubric: z
      .array(rubricCriterionSchema)
      .max(MAX_RUBRIC_CRITERIA, `A rubric may have at most ${MAX_RUBRIC_CRITERIA} criteria`),
  })
  // Same-day coursework is unusual but legal, so equal dates are valid.
  .refine((data) => new Date(data.due_date) >= new Date(data.assigned_date), {
    message: 'The due date cannot be before the assigned date',
    path: ['due_date'],
  })
  /**
   * The rubric has to be able to award exactly what the assignment is worth.
   * Criteria summing to 40 out of 50 silently caps every student at 80%, and
   * summing to 60 lets one exceed full marks.
   */
  .refine(
    (data) =>
      data.rubric.length === 0 ||
      Math.abs(data.rubric.reduce((total, row) => total + row.max_marks, 0) - data.max_marks) <
        0.001,
    {
      message: 'The criteria must add up to the assignment’s maximum marks',
      path: ['rubric'],
    },
  );

/**
 * Scoring one submission.
 *
 * The ceilings come from the assignment and its rubric, not the form, so the
 * schema is built per assignment rather than shared — awarding 12 for a
 * criterion worth 10 is the mistake this exists to stop.
 */
export function evaluationSchemaFor(assignment: { max_marks: number; rubric: RubricCriterion[] }) {
  const byId = new Map(assignment.rubric.map((criterion) => [criterion.id, criterion]));

  return z.object({
    criteria_scores: z
      .array(
        z.object({
          criterion_id: z.number().int(),
          marks_awarded: z
            .number({ invalid_type_error: 'Enter the marks awarded' })
            .min(0, 'Marks cannot be negative'),
          comment: optionalText(300, 'Comment is too long'),
        }),
      )
      .superRefine((scores, ctx) => {
        scores.forEach((score, index) => {
          // Without a rubric there is a single synthetic row worth the lot.
          const criterion = byId.get(score.criterion_id);
          const ceiling = criterion?.max_marks ?? assignment.max_marks;

          if (score.marks_awarded > ceiling) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [index, 'marks_awarded'],
              message: criterion
                ? `${criterion.name} is out of ${ceiling}`
                : `This assignment is out of ${ceiling}`,
            });
          }
        });
      }),

    feedback: optionalText(2000, 'Feedback is too long'),

    /** Marking the late penalty away — a deliberate act, recorded as one. */
    waive_late_penalty: z.boolean(),
  });
}

/** Standalone shape for typing; the ceilings are applied by the factory. */
export const evaluationSchema = evaluationSchemaFor({
  max_marks: MAX_ASSIGNMENT_MARKS,
  rubric: [],
});

/**
 * Handing work back for revision.
 *
 * Feedback is required here, unlike on an evaluation: a student cannot act on
 * "resubmit this" without being told what was wrong with it.
 */
export const returnForRevisionSchema = z.object({
  feedback: z
    .string()
    .min(10, 'Tell the student what to change')
    .max(2000, 'Feedback is too long'),
});

/** Recording work handed in offline, on the student's behalf. */
export const recordSubmissionSchema = z.object({
  student_note: optionalText(500, 'Note is too long'),
});

export type RubricCriterionInput = z.infer<typeof rubricCriterionSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type EvaluationInput = z.infer<typeof evaluationSchema>;
export type ReturnForRevisionInput = z.infer<typeof returnForRevisionSchema>;
export type RecordSubmissionInput = z.infer<typeof recordSubmissionSchema>;
