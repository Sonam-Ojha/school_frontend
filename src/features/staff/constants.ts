import type { Option, ToneName } from '@/types/common';

import type {
  EmploymentType,
  Shift,
  StaffDocumentType,
  StaffStatus,
  StaffType,
} from './types';

/** Permissions gating this module. Mirror these in the backend policy. */
export const STAFF_PERMISSIONS = {
  read: 'staff.read',
  create: 'staff.create',
  update: 'staff.update',
  delete: 'staff.delete',
  export: 'staff.export',
} as const;

/** The seven non-teaching roles this module manages. */
export const STAFF_TYPE_OPTIONS: Option<StaffType>[] = [
  { label: 'Accountant', value: 'accountant' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Librarian', value: 'librarian' },
  { label: 'Driver', value: 'driver' },
  { label: 'Cleaner', value: 'cleaner' },
  { label: 'Peon', value: 'peon' },
  { label: 'Security', value: 'security' },
];

export const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  accountant: 'Accountant',
  receptionist: 'Receptionist',
  librarian: 'Librarian',
  driver: 'Driver',
  cleaner: 'Cleaner',
  peon: 'Peon',
  security: 'Security',
};

/** Default designation per type — saves retyping the obvious on every record. */
export const DEFAULT_DESIGNATIONS: Record<StaffType, string> = {
  accountant: 'Accounts Officer',
  receptionist: 'Front Desk Executive',
  librarian: 'Librarian',
  driver: 'Bus Driver',
  cleaner: 'Housekeeping Attendant',
  peon: 'Office Attendant',
  security: 'Security Guard',
};

/**
 * Staff types that must hold a valid driving licence.
 *
 * Drives the conditional licence fields on the form and the expiry warning on
 * the profile — a bus driver with a lapsed licence is a real liability.
 */
export const LICENCE_REQUIRED_TYPES: readonly StaffType[] = ['driver'];

export const EMPLOYMENT_TYPE_OPTIONS: Option<EmploymentType>[] = [
  { label: 'Full time', value: 'full_time' },
  { label: 'Part time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Temporary', value: 'temporary' },
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  contract: 'Contract',
  temporary: 'Temporary',
};

export const SHIFT_OPTIONS: Option<Shift>[] = [
  { label: 'General (9–5)', value: 'general' },
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Night', value: 'night' },
];

export const SHIFT_LABELS: Record<Shift, string> = {
  general: 'General',
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

export const STATUS_OPTIONS: Option<StaffStatus>[] = [
  { label: 'Active', value: 'active' },
  { label: 'On leave', value: 'on_leave' },
  { label: 'Probation', value: 'probation' },
  { label: 'Resigned', value: 'resigned' },
  { label: 'Terminated', value: 'terminated' },
];

export const STATUS_LABELS: Record<StaffStatus, string> = {
  active: 'Active',
  on_leave: 'On leave',
  probation: 'Probation',
  resigned: 'Resigned',
  terminated: 'Terminated',
};

/** Green only for the status that means "on duty". */
export const STATUS_TONES: Record<StaffStatus, ToneName> = {
  active: 'success',
  on_leave: 'warning',
  probation: 'info',
  resigned: 'neutral',
  terminated: 'danger',
};

export const DOCUMENT_TYPE_OPTIONS: Option<StaffDocumentType>[] = [
  { label: 'Appointment letter', value: 'appointment_letter' },
  { label: 'ID proof', value: 'id_proof' },
  { label: 'Address proof', value: 'address_proof' },
  { label: 'PAN card', value: 'pan' },
  { label: 'Driving licence', value: 'driving_licence' },
  { label: 'Police verification', value: 'police_verification' },
  { label: 'Medical certificate', value: 'medical_certificate' },
  { label: 'Photograph', value: 'photo' },
  { label: 'Other', value: 'other' },
];

export const DOCUMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);
