import { z } from 'zod';

/**
 * Validation for each settings group. One schema per form, transform-free so
 * the inferred types match what the fields hold; normalisation happens in the
 * service. Rules mirror the backend FormRequests.
 */

const optionalText = (max: number, message: string) =>
  z.string().max(max, message).or(z.literal(''));

const phone = z
  .string()
  .min(1, 'Phone number is required')
  .refine((value) => /^[+]?[\d\s-]{7,20}$/.test(value.trim()), 'Enter a valid phone number');

export const schoolProfileSchema = z.object({
  name: z.string().min(2, 'School name is required').max(150, 'School name is too long'),
  code: z
    .string()
    .min(2, 'School code is required')
    .max(20, 'School code is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address').max(255),
  phone,
  website: z
    .string()
    .max(255, 'URL is too long')
    .refine(
      (value) => value.trim() === '' || /^https?:\/\/.+\..+/.test(value.trim()),
      'Enter a full URL including https://',
    ),
  motto: optionalText(200, 'Motto is too long'),
  principal_name: optionalText(150, 'Name is too long'),
  established_year: z
    .string()
    .refine((value) => {
      if (value.trim() === '') return true;
      const year = Number(value);
      // A school founded in the future, or before public schooling existed,
      // is a typo rather than a valid entry.
      return Number.isInteger(year) && year >= 1800 && year <= new Date().getFullYear();
    }, `Enter a year between 1800 and ${new Date().getFullYear()}`),
});

export const schoolAddressSchema = z.object({
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

export const localizationSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  locale: z.string().min(2, 'Locale is required'),
  date_format: z.string().min(1, 'Date format is required'),
  currency_code: z.string().length(3, 'Currency code must be 3 letters'),
  currency_symbol: z.string().min(1, 'Currency symbol is required').max(5, 'Symbol is too long'),
  currency_position: z.enum(['prefix', 'suffix']),
  // `z.number()` rather than `z.coerce.number()`: coercion makes the schema's
  // input type `unknown`, which desyncs it from the form's field value. The
  // numeric inputs are registered with `valueAsNumber` instead.
  currency_decimals: z
    .number({ invalid_type_error: 'Enter a number' })
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(4, 'At most 4 decimal places'),
});

export const emailSettingsSchema = z.object({
  enabled: z.boolean(),
  host: z.string().min(1, 'SMTP host is required').max(255),
  port: z
    .number({ invalid_type_error: 'Enter a port number' })
    .int('Port must be a whole number')
    .min(1, 'Enter a valid port')
    .max(65535, 'Enter a valid port'),
  encryption: z.enum(['tls', 'ssl', 'none']),
  username: z.string().max(255, 'Username is too long').or(z.literal('')),
  // Blank means "keep the stored password" — the service omits it entirely.
  password: z.string().max(255, 'Password is too long').or(z.literal('')),
  from_address: z
    .string()
    .min(1, 'From address is required')
    .email('Enter a valid email address')
    .max(255),
  from_name: z.string().min(1, 'From name is required').max(150, 'From name is too long'),
});

export const smsSettingsSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(['twilio', 'msg91', 'textlocal', 'nexmo', 'custom']),
  sender_id: z
    .string()
    .min(1, 'Sender ID is required')
    .max(15, 'Sender ID is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  /** Blank means "keep the stored key". */
  api_key: z.string().max(255, 'API key is too long').or(z.literal('')),
  endpoint: z
    .string()
    .max(255, 'URL is too long')
    .refine(
      (value) => value.trim() === '' || /^https?:\/\/.+\..+/.test(value.trim()),
      'Enter a full URL including https://',
    ),
});

export const academicYearSchema = z
  .object({
    name: z
      .string()
      .min(4, 'Session name is required')
      .max(30, 'Session name is too long')
      .regex(/^[A-Za-z0-9\s-]+$/, 'Use letters, numbers and hyphens only'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    is_current: z.boolean(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after the start date',
    path: ['end_date'],
  });

export const testEmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export const testSmsSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((value) => /^[+]?[\d\s-]{7,20}$/.test(value.trim()), 'Enter a valid phone number'),
});

export type SchoolProfileInput = z.infer<typeof schoolProfileSchema>;
export type SchoolAddressInput = z.infer<typeof schoolAddressSchema>;
export type LocalizationInput = z.infer<typeof localizationSchema>;
export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;
export type SmsSettingsInput = z.infer<typeof smsSettingsSchema>;
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
export type TestEmailInput = z.infer<typeof testEmailSchema>;
export type TestSmsInput = z.infer<typeof testSmsSchema>;
