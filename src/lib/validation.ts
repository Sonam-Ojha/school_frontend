import { z } from 'zod';

/**
 * Validation fragments shared by every person-shaped module (students,
 * teachers, staff).
 *
 * These rules are identical across modules, so they live here rather than
 * being restated — a change to what counts as a valid phone number should
 * happen once. Everything is transform-free so the inferred type matches what
 * the form field actually holds; normalisation happens in the service layer.
 */

/** Free text that may be left blank. */
export const optionalText = (max: number, message = 'This value is too long') =>
  z.string().max(max, message).or(z.literal(''));

/** A person's name — letters, spaces and the punctuation names actually use. */
export const personName = (label: string) =>
  z
    .string()
    .min(2, `${label} must be at least 2 characters`)
    .max(60, `${label} is too long`)
    .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, `${label} contains invalid characters`);

/** Optional middle name — same characters, but may be empty and may not lead. */
export const optionalName = (label: string) =>
  z
    .string()
    .max(60, `${label} is too long`)
    .regex(/^[A-Za-z\s.'-]*$/, `${label} contains invalid characters`);

export const requiredPhone = (message = 'Enter a valid phone number') =>
  z.string().refine((value) => /^[+]?[\d\s-]{7,20}$/.test(value.trim()), message);

export const optionalPhone = z
  .string()
  .refine(
    (value) => value.trim() === '' || /^[+]?[\d\s-]{7,20}$/.test(value.trim()),
    'Enter a valid phone number',
  );

export const requiredEmail = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(255, 'Email is too long');

export const optionalEmail = z
  .string()
  .refine(
    (value) => value.trim() === '' || z.string().email().safeParse(value.trim()).success,
    'Enter a valid email address',
  );

/**
 * A 24-hour clock time as `<input type="time">` produces it.
 *
 * Shared by the exam schedule and the timetable — two modules disagreeing on
 * what a valid time looks like is how a paper ends up at `9:5`.
 */
export const timeField = (label = 'Time') =>
  z
    .string()
    .min(1, `${label} is required`)
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a time as HH:mm');

/** Blank, or a number inside the given range. For optional numeric inputs. */
export const optionalNumber = (min: number, max: number, message: string) =>
  z.string().refine((value) => {
    if (value.trim() === '') return true;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
  }, message);

/** 12 digits, optionally spaced as people write them. */
export const optionalAadhaar = z
  .string()
  .refine(
    (value) => value.trim() === '' || /^\d{12}$/.test(value.replace(/\s/g, '')),
    'Aadhaar number must be 12 digits',
  );

export const optionalPan = z
  .string()
  .refine(
    (value) => value.trim() === '' || /^[A-Z]{5}\d{4}[A-Z]$/i.test(value.trim()),
    'Enter a valid PAN, e.g. ABCDE1234F',
  );

/** A date that must already have happened — dates of birth, joining dates. */
export const pastDate = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date < new Date();
    }, message);

/**
 * Postal address. Identical for every person-shaped module, so it is defined
 * once and imported rather than restated per feature.
 */
export const addressSchema = z.object({
  line1: z.string().min(3, 'Address line 1 is required').max(200, 'Address is too long'),
  line2: optionalText(200, 'Address is too long'),
  city: z.string().min(2, 'City is required').max(100, 'City is too long'),
  state: z.string().min(2, 'State is required').max(100, 'State is too long'),
  postal_code: z
    .string()
    .min(3, 'Postal code is required')
    .max(12, 'Postal code is too long')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Enter a valid postal code'),
  country: z.string().min(2, 'Country is required').max(100, 'Country is too long'),
});

export type AddressInput = z.infer<typeof addressSchema>;
