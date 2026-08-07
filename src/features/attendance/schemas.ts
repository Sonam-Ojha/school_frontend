import { z } from 'zod';

import { optionalText } from '@/lib/validation';

import { MAX_HOLIDAY_DAYS } from './constants';

const attendanceStatus = z.enum(['present', 'absent', 'late', 'half_day', 'leave']);

/** One row of a submitted sheet. */
export const attendanceMarkSchema = z.object({
  person_id: z.number(),
  status: attendanceStatus,
  remarks: optionalText(200, 'Remarks are too long'),
});

/**
 * A submitted sheet.
 *
 * Only changed rows are sent — a sheet of 50 students where two were absent
 * should not rewrite 48 unchanged records.
 */
export const attendanceSheetSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['student', 'teacher', 'staff']),
  class_id: z.number().nullable(),
  section_id: z.number().nullable(),
  entries: z.array(attendanceMarkSchema).min(1, 'Nothing to save — no rows were changed'),
});

export const holidaySchema = z
  .object({
    name: z
      .string()
      .min(2, 'Holiday name is required')
      .max(100, 'Holiday name is too long'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    type: z.enum(['public', 'school', 'vacation', 'exam'], {
      invalid_type_error: 'Select a holiday type',
    }),
    scope: z.enum(['all', 'students', 'employees'], { invalid_type_error: 'Select who it applies to' }),
    description: optionalText(300, 'Description is too long'),
  })
  // A single-day holiday has the same start and end, so equal dates are valid.
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date cannot be before the start date',
    path: ['end_date'],
  })
  .refine(
    (data) => {
      const days =
        (new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / 86_400_000 + 1;
      return days <= MAX_HOLIDAY_DAYS;
    },
    {
      message: `A holiday cannot span more than ${MAX_HOLIDAY_DAYS} days`,
      path: ['end_date'],
    },
  );

export const qrSessionSchema = z.object({
  type: z.enum(['student', 'teacher', 'staff']),
  class_id: z.number().nullable(),
  section_id: z.number().nullable(),
  /** Minutes the code stays valid. Short by design — a screenshot ages out. */
  valid_for_minutes: z
    .number({ invalid_type_error: 'Enter a duration in minutes' })
    .int('Enter a whole number of minutes')
    .min(1, 'Must be at least 1 minute')
    .max(180, 'Must be at most 180 minutes'),
});

export type AttendanceMarkInput = z.infer<typeof attendanceMarkSchema>;
export type AttendanceSheetInput = z.infer<typeof attendanceSheetSchema>;
export type HolidayInput = z.infer<typeof holidaySchema>;
export type QrSessionInput = z.infer<typeof qrSessionSchema>;
