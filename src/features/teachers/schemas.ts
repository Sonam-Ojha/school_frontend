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

/**
 * Teacher validation.
 *
 * Shape mirrors the request payload one-for-one, so Laravel's dotted error
 * keys (`qualifications.0.degree`, `address.city`) land on the right field
 * through `applyServerErrors` with no remapping.
 *
 * Transform-free: optional numbers are strings here and converted in the
 * service, because a numeric input left blank yields `NaN`, not `null`.
 *
 * The person-shaped rules come from `lib/validation` — teachers, staff and
 * students all share them.
 */

const CURRENT_YEAR = new Date().getFullYear();

const requiredText = (label: string, min: number, max: number) =>
  z.string().min(min, `${label} is required`).max(max, `${label} is too long`);

export const qualificationSchema = z.object({
  degree: requiredText('Degree', 2, 60),
  specialization: optionalText(80, 'Specialization is too long'),
  institution: requiredText('Institution', 2, 150),
  board_university: optionalText(150, 'Board or university is too long'),
  year_of_passing: z.string().refine((value) => {
    const year = Number(value);
    return Number.isInteger(year) && year >= 1950 && year <= CURRENT_YEAR;
  }, `Enter a year between 1950 and ${CURRENT_YEAR}`),
  grade: optionalText(20, 'Grade is too long'),
});

export const experienceSchema = z
  .object({
    organisation: requiredText('Organisation', 2, 150),
    designation: requiredText('Designation', 2, 100),
    from_date: z.string().min(1, 'Start date is required'),
    to_date: z.string(),
    is_current: z.boolean(),
    responsibilities: optionalText(500, 'Too long'),
  })
  // A finished role needs an end date; a current one does not.
  .refine((data) => data.is_current || data.to_date.trim() !== '', {
    message: 'End date is required unless this is the current role',
    path: ['to_date'],
  })
  .refine(
    (data) => data.is_current || !data.to_date || new Date(data.to_date) > new Date(data.from_date),
    { message: 'End date must be after the start date', path: ['to_date'] },
  );

export const classAssignmentSchema = z.object({
  class_id: z.number({ invalid_type_error: 'Select a class' }).int().positive('Select a class'),
  section_id: z.number().int().positive().nullable(),
  is_class_teacher: z.boolean(),
});

/** Re-exported so callers have one place to import a teacher's schemas from. */
export const teacherAddressSchema = addressSchema;

export const teacherSchema = z
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
    designation: requiredText('Designation', 2, 100),
    department: optionalText(100, 'Department is too long'),
    joining_date: z.string().min(1, 'Joining date is required'),
    employment_type: z.enum(['full_time', 'part_time', 'contract', 'visiting']),
    status: z.enum(['active', 'on_leave', 'probation', 'resigned', 'retired']),
    highest_qualification: optionalText(100, 'Too long'),

    address: addressSchema,
    qualifications: z.array(qualificationSchema).min(1, 'Add at least one qualification'),
    experiences: z.array(experienceSchema),
    subject_ids: z.array(z.number()),
    class_assignments: z.array(classAssignmentSchema),
  })
  .refine((data) => new Date(data.joining_date) > new Date(data.date_of_birth), {
    message: 'Joining date must be after the date of birth',
    path: ['joining_date'],
  })
  .refine(
    (data) => data.class_assignments.filter((entry) => entry.is_class_teacher).length <= 1,
    {
      // A teacher is responsible for at most one class — two would make the
      // "class teacher of" field on the roster ambiguous.
      message: 'A teacher can be class teacher of only one class',
      path: ['class_assignments'],
    },
  )
  .refine(
    (data) => {
      const seen = data.class_assignments.map(
        (entry) => `${entry.class_id}-${entry.section_id ?? 'all'}`,
      );
      return new Set(seen).size === seen.length;
    },
    { message: 'The same class and section is assigned twice', path: ['class_assignments'] },
  );

export type TeacherInput = z.infer<typeof teacherSchema>;
export type QualificationInput = z.infer<typeof qualificationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ClassAssignmentInput = z.infer<typeof classAssignmentSchema>;
export type TeacherAddressInput = z.infer<typeof teacherAddressSchema>;
