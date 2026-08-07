import { z } from 'zod';

import { optionalText } from '@/lib/validation';

import { MAX_HOMEWORK_MARKS } from './constants';

export const homeworkSchema = z
  .object({
    title: z.string().min(3, 'Title is required').max(150, 'Title is too long'),
    description: z
      .string()
      .min(10, 'Describe what the students have to do')
      .max(5000, 'Description is too long'),

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
      .int('Marks must be a whole number')
      .min(1, 'Maximum marks must be at least 1')
      .max(MAX_HOMEWORK_MARKS, `Maximum marks cannot exceed ${MAX_HOMEWORK_MARKS}`),
  })
  // Same-day homework is normal, so equal dates are valid.
  .refine((data) => new Date(data.due_date) >= new Date(data.assigned_date), {
    message: 'The due date cannot be before the assigned date',
    path: ['due_date'],
  });

/**
 * Grading a submission.
 *
 * `maxMarks` comes from the homework, not the form, so the ceiling is built
 * per-homework rather than shared — awarding 60 out of 50 is the mistake this
 * exists to stop.
 */
export function gradeSchemaFor(maxMarks: number) {
  return z.object({
    marks_obtained: z
      .number({ invalid_type_error: 'Enter the marks awarded' })
      .min(0, 'Marks cannot be negative')
      .max(maxMarks, `This homework is out of ${maxMarks}`),
    remarks: optionalText(1000, 'Remarks are too long'),
  });
}

/** Standalone shape for typing; the ceiling is applied by `gradeSchemaFor`. */
export const gradeSchema = gradeSchemaFor(MAX_HOMEWORK_MARKS);

/** Recording work handed in on paper, on the student's behalf. */
export const submissionSchema = z.object({
  student_note: optionalText(500, 'Note is too long'),
});

export type HomeworkInput = z.infer<typeof homeworkSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
