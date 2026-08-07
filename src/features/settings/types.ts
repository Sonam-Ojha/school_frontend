/** School-wide configuration, grouped the same way the settings screen is. */

export interface SchoolProfile {
  name: string;
  code: string;
  email: string;
  phone: string;
  website: string | null;
  motto: string | null;
  established_year: number | null;
  principal_name: string | null;
}

export interface SchoolAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export type CurrencyPosition = 'prefix' | 'suffix';

export interface LocalizationSettings {
  timezone: string;
  locale: string;
  date_format: string;
  currency_code: string;
  currency_symbol: string;
  currency_position: CurrencyPosition;
  currency_decimals: number;
}

export type MailEncryption = 'tls' | 'ssl' | 'none';

/**
 * SMTP configuration.
 *
 * The password is never returned by the API — `has_password` reports whether
 * one is stored, and a write only carries `password` when the user typed a
 * new one. Same pattern as `SmsSettings.api_key`.
 */
export interface EmailSettings {
  enabled: boolean;
  host: string;
  port: number;
  encryption: MailEncryption;
  username: string;
  has_password: boolean;
  from_address: string;
  from_name: string;
}

export type SmsProvider = 'twilio' | 'msg91' | 'textlocal' | 'nexmo' | 'custom';

export interface SmsSettings {
  enabled: boolean;
  provider: SmsProvider;
  sender_id: string;
  has_api_key: boolean;
  /** Only used when `provider` is `custom`. */
  endpoint: string | null;
}

export interface AcademicYear {
  id: number;
  /** Display name, e.g. `2025-2026`. */
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface SchoolSettings {
  profile: SchoolProfile;
  address: SchoolAddress;
  localization: LocalizationSettings;
  email: EmailSettings;
  sms: SmsSettings;
  logo_url: string | null;
  current_academic_year: AcademicYear | null;
  updated_at: string;
}

/** Which settings group a write targets — one endpoint per group. */
export type SettingsGroup = 'profile' | 'address' | 'localization' | 'email' | 'sms';
