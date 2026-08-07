import { z } from 'zod';

import {
  addressSchema,
  optionalAadhaar,
  optionalName,
  optionalPan,
  optionalPhone,
  optionalText,
  pastDate,
  personName,
  requiredEmail,
  requiredPhone,
} from '@/lib/validation';

import { LICENCE_REQUIRED_TYPES } from './constants';

/**
 * Staff validation.
 *
 * Shape mirrors the request payload one-for-one, so Laravel's dotted error
 * keys (`address.city`) land on the right field through `applyServerErrors`
 * with no remapping. Person-shaped rules come from `lib/validation`, shared
 * with teachers and students.
 */
export const staffSchema = z
  .object({
    // Personal
    first_name: personName('First name'),
    middle_name: optionalName('Middle name'),
    last_name: personName('Last name'),
    gender: z.enum(['male', 'female', 'other'], { invalid_type_error: 'Select a gender' }),
    date_of_birth: pastDate('Date of birth must be in the past'),
    blood_group: z.string().max(5).or(z.literal('')),
    marital_status: z.enum(['single', 'married', 'other']).or(z.literal('')),
    nationality: optionalText(50, 'Nationality is too long'),
    aadhaar_no: optionalAadhaar,
    pan_no: optionalPan,

    // Contact
    email: requiredEmail,
    phone: requiredPhone(),
    alternate_phone: optionalPhone,
    emergency_contact_name: optionalText(100, 'Name is too long'),
    emergency_contact_phone: optionalPhone,

    // Employment
    employee_id: z
      .string()
      .min(2, 'Employee ID is required')
      .max(30, 'Employee ID is too long')
      .regex(/^[A-Za-z0-9/-]+$/, 'Use letters, numbers, hyphens and slashes only'),
    staff_type: z.enum(
      ['accountant', 'receptionist', 'librarian', 'driver', 'cleaner', 'peon', 'security'],
      { invalid_type_error: 'Select a staff type' },
    ),
    designation: z
      .string()
      .min(2, 'Designation is required')
      .max(100, 'Designation is too long'),
    joining_date: z.string().min(1, 'Joining date is required'),
    employment_type: z.enum(['full_time', 'part_time', 'contract', 'temporary']),
    shift: z.enum(['general', 'morning', 'afternoon', 'night']),
    status: z.enum(['active', 'on_leave', 'probation', 'resigned', 'terminated']),
    reports_to: optionalText(100, 'Name is too long'),
    notes: optionalText(1000, 'Notes are too long'),

    // Licence — only meaningful for driving roles.
    licence_number: optionalText(30, 'Licence number is too long'),
    licence_expiry: z.string(),

    address: addressSchema,
  })
  .refine((data) => new Date(data.joining_date) > new Date(data.date_of_birth), {
    message: 'Joining date must be after the date of birth',
    path: ['joining_date'],
  })
  // A driver without a licence number on file is not something the school can
  // put behind a wheel.
  .refine(
    (data) =>
      !LICENCE_REQUIRED_TYPES.includes(data.staff_type) || data.licence_number.trim() !== '',
    { message: 'A driving licence number is required for drivers', path: ['licence_number'] },
  )
  .refine(
    (data) =>
      !LICENCE_REQUIRED_TYPES.includes(data.staff_type) || data.licence_expiry.trim() !== '',
    { message: 'Licence expiry date is required for drivers', path: ['licence_expiry'] },
  )
  // An already-expired licence is a data-entry mistake, not a valid record.
  .refine(
    (data) =>
      data.licence_expiry.trim() === '' || new Date(data.licence_expiry) > new Date(),
    { message: 'This licence has already expired', path: ['licence_expiry'] },
  );

export type StaffInput = z.infer<typeof staffSchema>;
