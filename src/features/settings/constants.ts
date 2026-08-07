import type { Option } from '@/types/common';

import type { CurrencyPosition, MailEncryption, SmsProvider } from './types';

/** Permissions gating this module. Mirror these in the backend policy. */
export const SETTINGS_PERMISSIONS = {
  read: 'settings.read',
  update: 'settings.update',
} as const;

export const ACADEMIC_YEAR_PERMISSIONS = {
  read: 'academic-years.read',
  create: 'academic-years.create',
  update: 'academic-years.update',
  delete: 'academic-years.delete',
} as const;

/**
 * IANA timezone list straight from the runtime, so it never goes stale.
 * `supportedValuesOf` is unavailable on older engines — fall back to the
 * zones an Indian school deployment realistically needs.
 */
export function timezoneOptions(): Option[] {
  const fallback = [
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Europe/London',
    'America/New_York',
    'UTC',
  ];

  const zones =
    typeof Intl.supportedValuesOf === 'function'
      ? (Intl.supportedValuesOf('timeZone') as string[])
      : fallback;

  return zones.map((zone) => ({ label: zone.replace(/_/g, ' '), value: zone }));
}

/** Common currencies with their symbols. Selecting one fills the symbol in. */
export const CURRENCIES: ReadonlyArray<{ code: string; symbol: string; label: string }> = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'LKR', symbol: 'Rs', label: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'Rs', label: 'Nepalese Rupee' },
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
];

export const CURRENCY_OPTIONS: Option[] = CURRENCIES.map(({ code, label, symbol }) => ({
  label: `${code} — ${label} (${symbol})`,
  value: code,
}));

export const CURRENCY_POSITION_OPTIONS: Option<CurrencyPosition>[] = [
  { label: 'Before amount (₹1,200)', value: 'prefix' },
  { label: 'After amount (1,200₹)', value: 'suffix' },
];

/** PHP/Carbon format strings, since the backend renders reports with them. */
export const DATE_FORMAT_OPTIONS: Option[] = [
  { label: '31 Dec 2025', value: 'd M Y' },
  { label: '31/12/2025', value: 'd/m/Y' },
  { label: '12/31/2025', value: 'm/d/Y' },
  { label: '2025-12-31', value: 'Y-m-d' },
  { label: '31 December 2025', value: 'd F Y' },
];

export const LOCALE_OPTIONS: Option[] = [
  { label: 'English (India)', value: 'en-IN' },
  { label: 'English (United States)', value: 'en-US' },
  { label: 'English (United Kingdom)', value: 'en-GB' },
  { label: 'Hindi', value: 'hi-IN' },
];

export const MAIL_ENCRYPTION_OPTIONS: Option<MailEncryption>[] = [
  { label: 'TLS (recommended)', value: 'tls' },
  { label: 'SSL', value: 'ssl' },
  { label: 'None', value: 'none' },
];

export const SMS_PROVIDER_OPTIONS: Option<SmsProvider>[] = [
  { label: 'Twilio', value: 'twilio' },
  { label: 'MSG91', value: 'msg91' },
  { label: 'Textlocal', value: 'textlocal' },
  { label: 'Vonage (Nexmo)', value: 'nexmo' },
  { label: 'Custom HTTP endpoint', value: 'custom' },
];

/** Placeholder shown in a secret field that already has a stored value. */
export const SECRET_PLACEHOLDER = '••••••••••••';
