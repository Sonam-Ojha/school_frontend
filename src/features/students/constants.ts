import type { Option, ToneName } from '@/types/common';

import type { DocumentType, Gender, GuardianRelation, StudentStatus } from './types';

/** Permissions gating this module. Mirror these in the backend policy. */
export const STUDENT_PERMISSIONS = {
  read: 'students.read',
  create: 'students.create',
  update: 'students.update',
  delete: 'students.delete',
  export: 'students.export',
  print: 'students.print',
} as const;

export const GENDER_OPTIONS: Option<Gender>[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const STATUS_OPTIONS: Option<StudentStatus>[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Graduated', value: 'graduated' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Suspended', value: 'suspended' },
];

/** Badge colour per status — green only for the one that means "enrolled". */
export const STATUS_TONES: Record<StudentStatus, ToneName> = {
  active: 'success',
  inactive: 'neutral',
  graduated: 'info',
  transferred: 'warning',
  suspended: 'danger',
};

export const STATUS_LABELS: Record<StudentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  graduated: 'Graduated',
  transferred: 'Transferred',
  suspended: 'Suspended',
};

export const BLOOD_GROUP_OPTIONS: Option[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
].map((group) => ({ label: group, value: group }));

export const RELATION_OPTIONS: Option<GuardianRelation>[] = [
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Guardian', value: 'guardian' },
];

export const RELATION_LABELS: Record<GuardianRelation, string> = {
  father: 'Father',
  mother: 'Mother',
  guardian: 'Guardian',
};

export const CATEGORY_OPTIONS: Option[] = ['General', 'OBC', 'SC', 'ST', 'EWS'].map((value) => ({
  label: value,
  value,
}));

export const BOARD_OPTIONS: Option[] = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'].map(
  (value) => ({ label: value, value }),
);

export const DOCUMENT_TYPE_OPTIONS: Option<DocumentType>[] = [
  { label: 'Birth certificate', value: 'birth_certificate' },
  { label: 'Transfer certificate', value: 'transfer_certificate' },
  { label: 'Previous marksheet', value: 'previous_marksheet' },
  { label: 'Photograph', value: 'photo' },
  { label: 'Aadhaar card', value: 'aadhaar' },
  { label: 'Caste certificate', value: 'caste_certificate' },
  { label: 'Medical record', value: 'medical_record' },
  { label: 'Other', value: 'other' },
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DocumentType, string>;

// Upload limits are shared across every document owner — see
// `types/documents.ts`. Re-exported so callers have one import to reach for.
export { DOCUMENT_ACCEPTED_TYPES, DOCUMENT_MAX_BYTES } from '@/types/documents';
