import type { PostalAddress } from '@/types/common';
import type { OwnedDocument } from '@/types/documents';

/** Non-teaching staff records. Teaching staff live in `features/teachers`. */

export type Gender = 'male' | 'female' | 'other';

/**
 * HR classification of a staff member.
 *
 * Distinct from their system role in `types/auth.ts`: this is what they *do*,
 * the role is what they may *access*. A librarian may or may not have a login.
 */
export type StaffType =
  | 'accountant'
  | 'receptionist'
  | 'librarian'
  | 'driver'
  | 'cleaner'
  | 'peon'
  | 'security';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary';

export type StaffStatus = 'active' | 'on_leave' | 'probation' | 'resigned' | 'terminated';

export type Shift = 'general' | 'morning' | 'afternoon' | 'night';

export type MaritalStatus = 'single' | 'married' | 'other';

export type StaffDocumentType =
  | 'appointment_letter'
  | 'id_proof'
  | 'address_proof'
  | 'pan'
  | 'driving_licence'
  | 'police_verification'
  | 'medical_certificate'
  | 'photo'
  | 'other';

export interface StaffDocument extends OwnedDocument {
  type: StaffDocumentType;
}

/** Row shape for the list — no nested relations, so the index stays cheap. */
export interface StaffMember {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: Gender;
  email: string;
  phone: string;
  photo_url: string | null;
  staff_type: StaffType;
  designation: string;
  joining_date: string;
  employment_type: EmploymentType;
  shift: Shift;
  status: StaffStatus;
  /** Drivers only — null for every other staff type. */
  licence_number: string | null;
  licence_expiry: string | null;
  created_at: string;
}

/** `GET /staff/{id}` — the full record behind the profile screen. */
export interface StaffMemberDetail extends StaffMember {
  middle_name: string | null;
  date_of_birth: string;
  blood_group: string | null;
  marital_status: MaritalStatus | null;
  nationality: string | null;
  aadhaar_no: string | null;
  pan_no: string | null;
  alternate_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  reports_to: string | null;
  notes: string | null;
  address: PostalAddress;
  documents_count: number;
  updated_at: string;
}
