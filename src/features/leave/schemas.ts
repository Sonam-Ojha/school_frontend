import { z } from 'zod';

import { optionalText } from '@/lib/validation';

import { MAX_REASON_LENGTH } from './constants';

/**
 * Leave validation.
 *
 * Transform-free like every other module: optional numbers are held as
 * strings and converted in the service, because a numeric input left blank
 * yields `NaN` rather than null.
 */

const applicantTypeEnum = z.enum(['student', 'teacher', 'staff'], {
  invalid_type_error: 'Who is this for?',
});

export const leaveTypeSchema = z
  .object({
    name: z.string().min(3, 'A name is required').max(60, 'Name is too long'),
    code: z
      .string()
      .min(2, 'A short code is required')
      .max(8, 'Keep the code to eight characters')
      .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
    applies_to: z.array(applicantTypeEnum).min(1, 'Choose who may apply for it'),
    /**
     * Blank means no entitlement behind it — students have none, and unpaid
     * leave is uncapped by definition. Held as a string so an empty box is
     * "none" rather than `NaN`.
     */
    annual_quota: z.string().refine((value) => {
      if (value.trim() === '') return true;
      const quota = Number(value);
      return Number.isFinite(quota) && quota > 0 && quota <= 365;
    }, 'Enter a quota between 1 and 365 days'),
    is_paid: z.boolean(),
    requires_document: z.boolean(),
    allows_backdated: z.boolean(),
    max_consecutive_days: z.string().refine((value) => {
      if (value.trim() === '') return true;
      const days = Number(value);
      return Number.isInteger(days) && days > 0 && days <= 365;
    }, 'Enter a limit between 1 and 365 days'),
    is_active: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.annual_quota.trim() === '' || data.max_consecutive_days.trim() === '') return true;
      return Number(data.max_consecutive_days) <= Number(data.annual_quota);
    },
    {
      message: 'A single stretch cannot exceed the annual quota',
      path: ['max_consecutive_days'],
    },
  );

export const applicationSchema = z
  .object({
    applicant_type: applicantTypeEnum,
    applicant_id: z
      .number({ invalid_type_error: 'Choose who this is for' })
      .int()
      .positive('Choose who this is for'),
    leave_type_id: z
      .number({ invalid_type_error: 'Choose a leave type' })
      .int()
      .positive('Choose a leave type'),
    from_date: z.string().min(1, 'A start date is required'),
    to_date: z.string().min(1, 'An end date is required'),
    day_portion: z.enum(['full', 'first_half', 'second_half'], {
      invalid_type_error: 'Full day or half?',
    }),
    reason: z
      .string()
      .min(5, 'Say why — a request nobody can weigh up is a request nobody can grant')
      .max(MAX_REASON_LENGTH, 'Reason is too long'),
    document_name: optionalText(120, 'File name is too long'),
  })
  .refine((data) => data.to_date >= data.from_date, {
    message: 'It cannot end before it starts',
    path: ['to_date'],
  })
  /**
   * A half day is a half of *one* day. Applying for "first half" across a
   * fortnight is a form nobody can price, and the API refuses it too.
   */
  .refine((data) => data.day_portion === 'full' || data.from_date === data.to_date, {
    message: 'A half day applies to a single date',
    path: ['day_portion'],
  });

/** A decision on somebody's application. */
export const reviewSchema = z
  .object({
    application_id: z.number().int().positive(),
    decision: z.enum(['approved', 'rejected'], { invalid_type_error: 'Approve or reject?' }),
    note: optionalText(300, 'Note is too long'),
  })
  /** A refusal nobody explains is a refusal nobody can appeal. */
  .refine((data) => data.decision === 'approved' || data.note.trim().length > 0, {
    message: 'Say why it is being refused',
    path: ['note'],
  });

export const cancelSchema = z.object({
  application_id: z.number().int().positive(),
  reason: z
    .string()
    .min(5, 'Say why the approval is being undone')
    .max(300, 'Reason is too long'),
});

export type LeaveTypeInput = z.infer<typeof leaveTypeSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CancelInput = z.infer<typeof cancelSchema>;
