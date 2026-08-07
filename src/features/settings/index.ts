/** Public surface of the school settings module. */

export { AcademicYearsCard } from './components/AcademicYearsCard';
export { AddressForm } from './components/AddressForm';
export { EmailSettingsForm } from './components/EmailSettingsForm';
export { LocalizationForm } from './components/LocalizationForm';
export { LogoUploader } from './components/LogoUploader';
export { SchoolProfileForm } from './components/SchoolProfileForm';
export { SettingsFormCard } from './components/SettingsFormCard';
export { SmsSettingsForm } from './components/SmsSettingsForm';

export {
  ACADEMIC_YEAR_PERMISSIONS,
  CURRENCIES,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  SETTINGS_PERMISSIONS,
  timezoneOptions,
} from './constants';

export {
  academicYearKeys,
  useAcademicYears,
  useActivateAcademicYear,
  useCreateAcademicYear,
  useDeleteAcademicYear,
  useUpdateAcademicYear,
} from './hooks/useAcademicYears';

export {
  settingsKeys,
  useSendTestEmail,
  useSendTestSms,
  useSettings,
  useUpdateAddress,
  useUpdateEmail,
  useUpdateLocalization,
  useUpdateProfile,
  useUpdateSms,
  useUploadLogo,
} from './hooks/useSettings';

export { academicYearService } from './services/academicYearService';
export { settingsService } from './services/settingsService';

export {
  academicYearSchema,
  emailSettingsSchema,
  localizationSchema,
  schoolAddressSchema,
  schoolProfileSchema,
  smsSettingsSchema,
  type AcademicYearInput,
  type EmailSettingsInput,
  type LocalizationInput,
  type SchoolAddressInput,
  type SchoolProfileInput,
  type SmsSettingsInput,
} from './schemas';

export type {
  AcademicYear,
  EmailSettings,
  LocalizationSettings,
  SchoolAddress,
  SchoolProfile,
  SchoolSettings,
  SmsSettings,
} from './types';
