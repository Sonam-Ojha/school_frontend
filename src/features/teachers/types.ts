import type { SubjectRef } from '@/features/academics/types';
import type { PostalAddress } from '@/types/common';
import type { OwnedDocument } from '@/types/documents';

/** Teacher records and everything hanging off them. */

export type Gender = 'male' | 'female' | 'other';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'visiting';

export type TeacherStatus = 'active' | 'on_leave' | 'probation' | 'resigned' | 'retired';

export type MaritalStatus = 'single' | 'married' | 'other';

export type TeacherDocumentType =
  | 'resume'
  | 'degree_certificate'
  | 'experience_letter'
  | 'appointment_letter'
  | 'photo'
  | 'aadhaar'
  | 'pan'
  | 'police_verification'
  | 'other';

export interface Qualification {
  id: number;
  /** e.g. `M.Sc.`, `B.Ed.` */
  degree: string;
  specialization: string | null;
  institution: string;
  board_university: string | null;
  year_of_passing: number;
  grade: string | null;
}

export interface Experience {
  id: number;
  organisation: string;
  designation: string;
  from_date: string;
  /** Null while `is_current` is true. */
  to_date: string | null;
  is_current: boolean;
  responsibilities: string | null;
}

/** One class-section a teacher teaches. */
export interface ClassAssignment {
  class_id: number;
  class_name: string;
  section_id: number | null;
  section_name: string | null;
  /** At most one per teacher — the class they are responsible for. */
  is_class_teacher: boolean;
}

/** Identical to every other module's address — see `types/common.ts`. */
export type TeacherAddress = PostalAddress;

export interface TeacherDocument extends OwnedDocument {
  type: TeacherDocumentType;
}

/** Row shape for the list — no nested relations, so the index stays cheap. */
export interface Teacher {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: Gender;
  email: string;
  phone: string;
  photo_url: string | null;
  designation: string;
  department: string | null;
  joining_date: string;
  employment_type: EmploymentType;
  status: TeacherStatus;
  /** Total prior experience in years, computed by the API. */
  experience_years: number;
  subjects_count: number;
  classes_count: number;
  /** Denormalised for the list column — avoids loading the assignment relation. */
  class_teacher_of: string | null;
  created_at: string;
}

/** `GET /teachers/{id}` — the full record behind the profile screen. */
export interface TeacherDetail extends Teacher {
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
  highest_qualification: string | null;
  address: TeacherAddress;
  qualifications: Qualification[];
  experiences: Experience[];
  subjects: SubjectRef[];
  class_assignments: ClassAssignment[];
  documents_count: number;
  updated_at: string;
}
