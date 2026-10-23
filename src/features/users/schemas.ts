import { z } from 'zod';

/**
 * User account validation. Transform-free so the inferred type matches the
 * form's field values; normalisation happens in the service.
 */

/** Keep in sync with the sign-in rules in `features/auth/schemas.ts`. */
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const base = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255, 'Email is too long'),
  // Optional: an empty field is valid and reaches the API as null.
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .refine(
      (value) => value.trim() === '' || /^[+]?[\d\s-]{7,20}$/.test(value.trim()),
      'Enter a valid phone number',
    ),
  // Role ids from the picker; the service turns them into the slugs the API takes.
  role_ids: z.array(z.number()).min(1, 'Choose at least one role'),
  is_active: z.boolean(),
  // Who on the rosters this account is. A parent's children go in
  // `student_ids`; so does the one student a student account belongs to.
  student_ids: z.array(z.number()),
  teacher_id: z.number().nullable(),
  staff_id: z.number().nullable(),
});

/** A new account always needs a password. */
export const createUserSchema = base.extend({ password });

/** Editing leaves the password alone unless a new one is typed. */
export const updateUserSchema = base.extend({
  password: z.union([z.literal(''), password]),
});

export type UserInput = z.infer<typeof createUserSchema>;
