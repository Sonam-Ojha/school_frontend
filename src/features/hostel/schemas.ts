import { z } from 'zod';

import { optionalText } from '@/lib/validation';
import { todayInputValue } from '@/lib/format';

import { MAX_BEDS_PER_ROOM } from './constants';

/**
 * Hostel validation.
 *
 * Transform-free like every other module: optional numbers are held as
 * strings and converted in the service, because a numeric input left blank
 * yields `NaN` rather than null.
 */

export const hostelSchema = z.object({
  name: z.string().min(3, 'Hostel name is required').max(80, 'Name is too long'),
  code: z
    .string()
    .min(2, 'A block code is required')
    .max(10, 'Code is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  type: z.enum(['boys', 'girls'], { invalid_type_error: 'Whose hostel is this?' }),
  address: optionalText(200, 'Address is too long'),
  /** Null is a block nobody has been put in charge of yet. */
  warden_id: z.number().int().positive().nullable(),
  mess_charge: z
    .number({ invalid_type_error: 'Enter the monthly mess charge' })
    .min(0, 'The charge cannot be negative')
    .max(100_000, 'That charge looks wrong'),
  is_active: z.boolean(),
});

export const roomSchema = z.object({
  hostel_id: z
    .number({ invalid_type_error: 'Select a hostel' })
    .int()
    .positive('Select a hostel'),
  room_no: z
    .string()
    .min(1, 'A room number is required')
    .max(12, 'Room number is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  floor: z
    .number({ invalid_type_error: 'Which floor?' })
    .int('Floor must be a whole number')
    .min(0, 'Ground is floor 0')
    .max(20, 'That is a very tall hostel'),
  type: z.enum(['single', 'double', 'triple', 'quad', 'dormitory'], {
    invalid_type_error: 'Select a room type',
  }),
  monthly_rent: z
    .number({ invalid_type_error: 'Enter the monthly rent' })
    .min(0, 'Rent cannot be negative')
    .max(500_000, 'That rent looks wrong'),
  has_ac: z.boolean(),
  has_attached_bath: z.boolean(),
  /**
   * Only the states a person sets. `full` is derived from the beds, and
   * offering it here would let somebody declare a room full that is not.
   */
  status: z.enum(['available', 'maintenance', 'blocked'], {
    invalid_type_error: 'Select a status',
  }),
  notes: optionalText(300, 'Notes are too long'),
});

/**
 * Adding beds.
 *
 * Bed numbers are minted by the API in a run rather than typed — a warden
 * furnishing a dormitory should not key sixteen labels, and uniqueness within
 * the room is not something a form can promise.
 */
export const addBedsSchema = z.object({
  quantity: z
    .number({ invalid_type_error: 'How many beds?' })
    .int('Enter a whole number of beds')
    .min(1, 'Add at least one bed')
    .max(MAX_BEDS_PER_ROOM, `A room cannot hold more than ${MAX_BEDS_PER_ROOM} beds`),
  notes: optionalText(200, 'Notes are too long'),
});

export const bedSchema = z.object({
  bed_no: z
    .string()
    .min(1, 'A bed label is required')
    .max(8, 'Bed label is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  status: z.enum(['vacant', 'reserved', 'maintenance'], {
    invalid_type_error: 'Select a status',
  }),
  notes: optionalText(200, 'Notes are too long'),
});

export const allocationSchema = z.object({
  student_id: z
    .number({ invalid_type_error: 'Choose a student' })
    .int()
    .positive('Choose a student'),
  hostel_id: z.number({ invalid_type_error: 'Choose a hostel' }).int().positive('Choose a hostel'),
  room_id: z.number({ invalid_type_error: 'Choose a room' }).int().positive('Choose a room'),
  bed_id: z.number({ invalid_type_error: 'Choose a bed' }).int().positive('Choose a bed'),
  mess_plan: z.enum(['full', 'breakfast_dinner', 'none'], {
    invalid_type_error: 'Select a mess plan',
  }),
  allocated_on: z.string().min(1, 'A start date is required'),
});

export const vacateSchema = z
  .object({
    allocation_id: z.number().int().positive(),
    vacated_on: z.string().min(1, 'A leaving date is required'),
    /** Vacating early is a decision somebody should have to account for. */
    reason: optionalText(200, 'Reason is too long'),
  })
  .refine((data) => data.vacated_on <= todayInputValue(), {
    message: 'A leaving date cannot be in the future',
    path: ['vacated_on'],
  });

/**
 * One resident's mark on one night.
 *
 * Remarks are required for anything other than present: "absent" without a
 * word about it is the entry a warden is asked about a week later.
 */
export const rollCallEntrySchema = z
  .object({
    allocation_id: z.number().int().positive(),
    status: z.enum(['present', 'absent', 'on_leave', 'out_pass', 'late_return'], {
      invalid_type_error: 'Select a status',
    }),
    remarks: optionalText(200, 'Remarks are too long'),
  })
  .refine((data) => data.status === 'present' || data.remarks.trim().length > 0, {
    message: 'Say why',
    path: ['remarks'],
  });

/** A submitted roll call. Only the rows that changed are sent. */
export const rollCallSchema = z.object({
  hostel_id: z.number().int().positive(),
  date: z.string().min(1, 'A date is required'),
  entries: z.array(rollCallEntrySchema).min(1, 'Nothing to save — no rows were changed'),
});

/** Raising a month's hostel charges into the fee ledger. */
export const raiseChargesSchema = z.object({
  hostel_id: z.number().int().positive(),
  /** `YYYY-MM` — a month is billed once. */
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Choose a month'),
});

export type HostelInput = z.infer<typeof hostelSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type AddBedsInput = z.infer<typeof addBedsSchema>;
export type BedInput = z.infer<typeof bedSchema>;
export type AllocationInput = z.infer<typeof allocationSchema>;
export type VacateInput = z.infer<typeof vacateSchema>;
export type RollCallEntryInput = z.infer<typeof rollCallEntrySchema>;
export type RollCallInput = z.infer<typeof rollCallSchema>;
export type RaiseChargesInput = z.infer<typeof raiseChargesSchema>;
