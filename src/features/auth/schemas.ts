import { z } from 'zod';

/**
 * Client-side validation for every auth form.
 *
 * This is the single source of truth on the frontend — payload types are
 * inferred from these schemas, never declared separately. Rules mirror the
 * backend FormRequests; the server remains authoritative and its 422s are
 * projected back onto fields by `applyServerErrors`.
 *
 * Schemas stay transform-free so the inferred type matches what the form
 * fields actually hold. Normalisation (trimming, empty string → null) happens
 * in the service layer, right before the request.
 */

const email = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(255, 'Email is too long');

/** Keep in sync with Laravel's `Password::min(8)->letters()->numbers()`. */
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const loginSchema = z.object({
  email,
  // Deliberately not the `password` rules above: an existing account may
  // predate the current policy, and restating the rules on a sign-in screen
  // only helps credential guessing.
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is missing'),
    email,
    password,
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password,
    password_confirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .refine((data) => data.current_password !== data.password, {
    message: 'New password must be different from your current password',
    path: ['password'],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long'),
  email,
  // Optional: an empty field is valid and reaches the API as null.
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .refine(
      (value) => value.trim() === '' || /^[+]?[\d\s-]{7,20}$/.test(value.trim()),
      'Enter a valid phone number',
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
