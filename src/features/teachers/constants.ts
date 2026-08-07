import type { Option, ToneName } from '@/types/common';

import type {
  EmploymentType,
  Gender,
  MaritalStatus,
  TeacherDocumentType,
  TeacherStatus,
} from './types';

/** Permissions gating this module. Mirror these in the backend policy. */
export const TEACHER_PERMISSIONS = {
  read: 'teachers.read',
  create: 'teachers.create',
  update: 'teachers.update',
  delete: 'teachers.delete',
  export: 'teachers.export',
} as const;

export const GENDER_OPTIONS: Option<Gender>[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const MARITAL_STATUS_OPTIONS: Option<MaritalStatus>[] = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Prefer not to say', value: 'other' },
];

export const EMPLOYMENT_TYPE_OPTIONS: Option<EmploymentType>[] = [
  { label: 'Full time', value: 'full_time' },
  { label: 'Part time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Visiting', value: 'visiting' },
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  contract: 'Contract',
  visiting: 'Visiting',
};

export const STATUS_OPTIONS: Option<TeacherStatus>[] = [
  { label: 'Active', value: 'active' },
  { label: 'On leave', value: 'on_leave' },
  { label: 'Probation', value: 'probation' },
  { label: 'Resigned', value: 'resigned' },
  { label: 'Retired', value: 'retired' },
];

export const STATUS_LABELS: Record<TeacherStatus, string> = {
  active: 'Active',
  on_leave: 'On leave',
  probation: 'Probation',
  resigned: 'Resigned',
  retired: 'Retired',
};

/** Green only for the status that means "teaching right now". */
export const STATUS_TONES: Record<TeacherStatus, ToneName> = {
  active: 'success',
  on_leave: 'warning',
  probation: 'info',
  resigned: 'neutral',
  retired: 'neutral',
};

export const DESIGNATION_OPTIONS: Option[] = [
  'Principal',
  'Vice Principal',
  'Head of Department',
  'Senior Teacher',
  'Teacher',
  'Assistant Teacher',
  'Lab Assistant',
  'Sports Coach',
  'Librarian',
  'Counsellor',
].map((value) => ({ label: value, value }));

export const DEPARTMENT_OPTIONS: Option[] = [
  'Science',
  'Mathematics',
  'Languages',
  'Social Studies',
  'Computer Science',
  'Commerce',
  'Physical Education',
  'Arts',
  'Administration',
].map((value) => ({ label: value, value }));

export const BLOOD_GROUP_OPTIONS: Option[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
  (group) => ({ label: group, value: group }),
);

export const DOCUMENT_TYPE_OPTIONS: Option<TeacherDocumentType>[] = [
  { label: 'Résumé / CV', value: 'resume' },
  { label: 'Degree certificate', value: 'degree_certificate' },
  { label: 'Experience letter', value: 'experience_letter' },
  { label: 'Appointment letter', value: 'appointment_letter' },
  { label: 'Photograph', value: 'photo' },
  { label: 'Aadhaar card', value: 'aadhaar' },
  { label: 'PAN card', value: 'pan' },
  { label: 'Police verification', value: 'police_verification' },
  { label: 'Other', value: 'other' },
];

export const DOCUMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);
