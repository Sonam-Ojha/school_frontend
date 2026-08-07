import { z } from 'zod';

import { optionalText, timeField } from '@/lib/validation';

import { MAX_DURATION_MINUTES, MAX_PAPER_MARKS } from './constants';

export const examSchema = z
  .object({
    name: z.string().min(3, 'Exam name is required').max(120, 'Name is too long'),
    type: z.enum(['unit_test', 'mid_term', 'half_yearly', 'annual', 'pre_board', 'practical'], {
      invalid_type_error: 'Select an exam type',
    }),
    academic_year_id: z
      .number({ invalid_type_error: 'Select an academic year' })
      .int()
      .positive('Select an academic year'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    description: optionalText(1000, 'Description is too long'),
  })
  // A single-day exam has the same start and end, so equal dates are valid.
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'The end date cannot be before the start date',
    path: ['end_date'],
  });

const basePaperSchema = z.object({
  class_id: z.number({ invalid_type_error: 'Select a class' }).int().positive('Select a class'),
  /** Null means every section of the class sits it together. */
  section_id: z.number().int().positive().nullable(),
  subject_id: z
    .number({ invalid_type_error: 'Select a subject' })
    .int()
    .positive('Select a subject'),

  exam_date: z.string().min(1, 'Exam date is required'),
  start_time: timeField('Start time'),
  duration_minutes: z
    .number({ invalid_type_error: 'Enter the duration in minutes' })
    .int('Duration must be a whole number of minutes')
    .min(5, 'A paper must be at least 5 minutes')
    .max(MAX_DURATION_MINUTES, `A paper cannot exceed ${MAX_DURATION_MINUTES} minutes`),
  room: optionalText(40, 'Room name is too long'),

  max_marks: z
    .number({ invalid_type_error: 'Enter the maximum marks' })
    .min(1, 'Maximum marks must be at least 1')
    .max(MAX_PAPER_MARKS, `Maximum marks cannot exceed ${MAX_PAPER_MARKS}`),
  pass_marks: z
    .number({ invalid_type_error: 'Enter the pass marks' })
    .min(0, 'Pass marks cannot be negative'),
});

/**
 * A paper, validated against the exam it belongs to.
 *
 * The date window comes from the exam, so the schema is built per exam rather
 * than shared — a paper scheduled outside its own exam is a mistake no
 * generic rule could catch.
 */
export function paperSchemaFor(examStart: string, examEnd: string) {
  return basePaperSchema
    .refine((data) => data.pass_marks <= data.max_marks, {
      message: 'Pass marks cannot exceed the maximum',
      path: ['pass_marks'],
    })
    .refine((data) => data.exam_date >= examStart && data.exam_date <= examEnd, {
      message: 'This date falls outside the exam period',
      path: ['exam_date'],
    });
}

/** Standalone shape for typing; the window is applied by `paperSchemaFor`. */
export const paperSchema = basePaperSchema;

/**
 * One student's mark, validated against the paper's own ceiling.
 *
 * An absent student has no mark — the two are mutually exclusive, and a zero
 * for an absentee is a different claim from "did not sit it".
 */
export function markSchemaFor(maxMarks: number) {
  return z
    .object({
      student_id: z.number().int().positive(),
      marks_obtained: z
        .number({ invalid_type_error: 'Enter the marks' })
        .min(0, 'Marks cannot be negative')
        .max(maxMarks, `This paper is out of ${maxMarks}`)
        .nullable(),
      is_absent: z.boolean(),
      remarks: optionalText(200, 'Remarks are too long'),
    })
    .refine((data) => !data.is_absent || data.marks_obtained === null, {
      message: 'An absent student cannot have marks',
      path: ['marks_obtained'],
    });
}

/** A submitted marks sheet. Only changed rows are sent. */
export function marksSheetSchemaFor(maxMarks: number) {
  return z.object({
    marks: z
      .array(markSchemaFor(maxMarks))
      .min(1, 'Nothing to save — no rows were changed'),
  });
}

export const publishResultsSchema = z.object({
  class_id: z.number().int().positive(),
  section_id: z.number().int().positive().nullable(),
  remarks: optionalText(500, 'Remarks are too long'),
});

export type ExamInput = z.infer<typeof examSchema>;
export type PaperInput = z.infer<typeof paperSchema>;
export type MarkInput = z.infer<ReturnType<typeof markSchemaFor>>;
export type MarksSheetInput = z.infer<ReturnType<typeof marksSheetSchemaFor>>;
export type PublishResultsInput = z.infer<typeof publishResultsSchema>;
