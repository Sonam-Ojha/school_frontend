import { z } from 'zod';

import {
  optionalEmail,
  optionalNumber,
  optionalPhone,
  optionalText,
  personName as name,
  requiredPhone as phone,
  addressSchema as sharedAddressSchema,
} from '@/lib/validation';

/**
 * Admission and edit validation.
 *
 * The schema's shape deliberately mirrors the request payload one-for-one, so
 * Laravel's dotted error keys (`guardians.0.phone`, `address.city`) land on the
 * right field through `applyServerErrors` without any remapping.
 *
 * Transform-free: optional numbers are typed as strings here and converted in
 * the service, because a numeric input left blank yields `NaN`, not `null`.
 */

// The fragments above are the shared ones from `lib/validation.ts`, aliased to
// the names this module reads best with. They were once restated here, which
// meant a change to what counts as a valid phone number had two homes.

// --- sections ---------------------------------------------------------------

// The postal address is identical for every person-shaped module — see
// `lib/validation.ts`. Re-exported so callers have one import to reach for.
export { addressSchema } from '@/lib/validation';

export const guardianSchema = z.object({
  relation: z.enum(['father', 'mother', 'guardian']),
  name: name('Guardian name'),
  occupation: optionalText(100, 'Occupation is too long'),
  phone: phone(),
  email: optionalEmail,
  annual_income: optionalNumber(0, 1_000_000_000, 'Enter a valid amount'),
  is_primary: z.boolean(),
});

export const medicalSchema = z.object({
  blood_group: z.string().max(5).or(z.literal('')),
  height_cm: optionalNumber(30, 250, 'Enter a height between 30 and 250 cm'),
  weight_kg: optionalNumber(2, 200, 'Enter a weight between 2 and 200 kg'),
  allergies: optionalText(500, 'Too long'),
  chronic_conditions: optionalText(500, 'Too long'),
  medications: optionalText(500, 'Too long'),
  doctor_name: optionalText(100, 'Name is too long'),
  doctor_phone: optionalPhone,
  emergency_contact_name: optionalText(100, 'Name is too long'),
  emergency_contact_phone: optionalPhone,
  notes: optionalText(1000, 'Too long'),
});

export const previousSchoolSchema = z.object({
  school_name: optionalText(150, 'School name is too long'),
  board: optionalText(50, 'Board is too long'),
  last_class: optionalText(30, 'Class is too long'),
  passing_year: optionalNumber(1950, new Date().getFullYear(), 'Enter a valid year'),
  percentage: optionalNumber(0, 100, 'Enter a percentage between 0 and 100'),
  tc_number: optionalText(50, 'Certificate number is too long'),
  reason_for_leaving: optionalText(300, 'Too long'),
});

// --- the whole record -------------------------------------------------------

export const studentSchema = z
  .object({
    // Personal
    first_name: name('First name'),
    middle_name: z
      .string()
      .max(60, 'Middle name is too long')
      .regex(/^[A-Za-z\s.'-]*$/, 'Middle name contains invalid characters')
      .or(z.literal('')),
    last_name: name('Last name'),
    gender: z.enum(['male', 'female', 'other'], { invalid_type_error: 'Select a gender' }),
    date_of_birth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;
        // A future date of birth is always a typo.
        return date < new Date();
      }, 'Date of birth must be in the past'),
    blood_group: z.string().max(5).or(z.literal('')),
    category: optionalText(30, 'Category is too long'),
    religion: optionalText(50, 'Religion is too long'),
    nationality: optionalText(50, 'Nationality is too long'),
    mother_tongue: optionalText(50, 'Language is too long'),
    aadhaar_no: z
      .string()
      .refine(
        (value) => value.trim() === '' || /^\d{12}$/.test(value.replace(/\s/g, '')),
        'Aadhaar number must be 12 digits',
      ),

    // Enrolment
    admission_no: z
      .string()
      .min(2, 'Admission number is required')
      .max(30, 'Admission number is too long')
      .regex(/^[A-Za-z0-9/-]+$/, 'Use letters, numbers, hyphens and slashes only'),
    roll_no: optionalText(20, 'Roll number is too long'),
    class_id: z.number({ invalid_type_error: 'Select a class' }).int().positive('Select a class'),
    section_id: z.number().int().positive().nullable(),
    admission_date: z.string().min(1, 'Admission date is required'),
    status: z.enum(['active', 'inactive', 'graduated', 'transferred', 'suspended']),

    // Contact
    email: optionalEmail,
    phone: optionalPhone,

    address: sharedAddressSchema,
    // At least one guardian, and exactly one marked primary.
    guardians: z.array(guardianSchema).min(1, 'Add at least one parent or guardian'),
    medical: medicalSchema,
    previous_school: previousSchoolSchema,
  })
  .refine((data) => data.guardians.filter((guardian) => guardian.is_primary).length === 1, {
    message: 'Mark exactly one guardian as the primary contact',
    path: ['guardians'],
  })
  .refine((data) => new Date(data.admission_date) >= new Date(data.date_of_birth), {
    message: 'Admission date cannot be before the date of birth',
    path: ['admission_date'],
  });

export type StudentInput = z.infer<typeof studentSchema>;
export type GuardianInput = z.infer<typeof guardianSchema>;
export type { AddressInput } from '@/lib/validation';
export type MedicalInput = z.infer<typeof medicalSchema>;
export type PreviousSchoolInput = z.infer<typeof previousSchoolSchema>;

/** Fields validated by each admission step, for `form.trigger()`. */
export const STEP_FIELDS = {
  personal: [
    'first_name',
    'middle_name',
    'last_name',
    'gender',
    'date_of_birth',
    'blood_group',
    'category',
    'religion',
    'nationality',
    'mother_tongue',
    'aadhaar_no',
    'admission_no',
    'roll_no',
    'class_id',
    'section_id',
    'admission_date',
    'status',
    'email',
    'phone',
    'address',
  ],
  guardians: ['guardians'],
  medical: ['medical'],
  previousSchool: ['previous_school'],
} as const;

export const documentUploadSchema = z.object({
  type: z.enum([
    'birth_certificate',
    'transfer_certificate',
    'previous_marksheet',
    'photo',
    'aadhaar',
    'caste_certificate',
    'medical_record',
    'other',
  ]),
  title: z.string().min(2, 'Title is required').max(100, 'Title is too long'),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
