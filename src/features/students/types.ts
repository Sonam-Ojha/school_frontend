import type { PostalAddress } from '@/types/common';
import type { OwnedDocument } from '@/types/documents';

/** Student records and everything hanging off them. */

export type Gender = 'male' | 'female' | 'other';

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred' | 'suspended';

export type GuardianRelation = 'father' | 'mother' | 'guardian';

export type DocumentType =
  | 'birth_certificate'
  | 'transfer_certificate'
  | 'previous_marksheet'
  | 'photo'
  | 'aadhaar'
  | 'caste_certificate'
  | 'medical_record'
  | 'other';

export interface Guardian {
  id: number;
  relation: GuardianRelation;
  name: string;
  occupation: string | null;
  phone: string;
  email: string | null;
  annual_income: number | null;
  /** The guardian contacted first. Exactly one per student. */
  is_primary: boolean;
}

export interface MedicalInfo {
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  allergies: string | null;
  chronic_conditions: string | null;
  medications: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
}

export interface PreviousSchool {
  school_name: string | null;
  board: string | null;
  last_class: string | null;
  passing_year: number | null;
  percentage: number | null;
  tc_number: string | null;
  reason_for_leaving: string | null;
}

/** Identical to every other module's address — see `types/common.ts`. */
export type StudentAddress = PostalAddress;

/** Narrows the shared document shape to the types a student record accepts. */
export interface StudentDocument extends OwnedDocument {
  type: DocumentType;
}

/** Row shape for the list — no nested relations, so the index stays cheap. */
export interface Student {
  id: number;
  admission_no: string;
  roll_no: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  class_id: number;
  class_name: string;
  section_id: number | null;
  section_name: string | null;
  admission_date: string;
  status: StudentStatus;
  /** Denormalised for the list column — avoids loading the guardian relation. */
  primary_guardian_name: string | null;
  primary_guardian_phone: string | null;
  created_at: string;
}

/** `GET /students/{id}` — the full record behind the profile screen. */
export interface StudentDetail extends Student {
  middle_name: string | null;
  blood_group: string | null;
  category: string | null;
  religion: string | null;
  nationality: string | null;
  mother_tongue: string | null;
  aadhaar_no: string | null;
  academic_year_id: number;
  academic_year_name: string;
  address: StudentAddress;
  guardians: Guardian[];
  medical: MedicalInfo;
  previous_school: PreviousSchool;
  documents_count: number;
  updated_at: string;
}

export type ExportFormat = 'pdf' | 'excel';
